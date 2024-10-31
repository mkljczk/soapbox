import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { expandSearch, setFilter, setSearchAccount } from 'pl-fe/actions/search';
import { fetchTrendingStatuses } from 'pl-fe/actions/trending-statuses';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import { useTrendingLinks } from 'pl-fe/api/hooks/trends/use-trending-links';
import Hashtag from 'pl-fe/components/hashtag';
import IconButton from 'pl-fe/components/icon-button';
import ScrollableList from 'pl-fe/components/scrollable-list';
import TrendingLink from 'pl-fe/components/trending-link';
import HStack from 'pl-fe/components/ui/hstack';
import Tabs from 'pl-fe/components/ui/tabs';
import Text from 'pl-fe/components/ui/text';
import AccountContainer from 'pl-fe/containers/account-container';
import StatusContainer from 'pl-fe/containers/status-container';
import PlaceholderAccount from 'pl-fe/features/placeholder/components/placeholder-account';
import PlaceholderHashtag from 'pl-fe/features/placeholder/components/placeholder-hashtag';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';

import type { SearchFilter } from 'pl-fe/reducers/search';

const messages = defineMessages({
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
  links: { id: 'search_results.links', defaultMessage: 'News' },
});

const SearchResults = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const [tabKey, setTabKey] = useState(1);

  const value = useAppSelector((state) => state.search.submittedValue);
  const results = useAppSelector((state) => state.search.results);
  const suggestions = useAppSelector((state) => state.suggestions.items);
  const trendingStatuses = useAppSelector((state) => state.trending_statuses.items);
  const trends = useAppSelector((state) => state.trends.items);
  const submitted = useAppSelector((state) => state.search.submitted);
  const selectedFilter = useAppSelector((state) => state.search.filter);
  const filterByAccount = useAppSelector((state) => state.search.accountId || undefined);
  const { trendingLinks } = useTrendingLinks();
  const { account } = useAccount(filterByAccount);

  const handleLoadMore = () => dispatch(expandSearch(selectedFilter));

  const handleUnsetAccount = () => dispatch(setSearchAccount(null));

  const selectFilter = (newActiveFilter: SearchFilter) => dispatch(setFilter(value, newActiveFilter));

  const renderFilterBar = () => {
    const items = [];
    items.push(
      {
        text: intl.formatMessage(messages.accounts),
        action: () => selectFilter('accounts'),
        name: 'accounts',
      },
      {
        text: intl.formatMessage(messages.statuses),
        action: () => selectFilter('statuses'),
        name: 'statuses',
      },
      {
        text: intl.formatMessage(messages.hashtags),
        action: () => selectFilter('hashtags'),
        name: 'hashtags',
      },
    );

    if (!submitted && features.trendingLinks) items.push({
      text: intl.formatMessage(messages.links),
      action: () => selectFilter('links'),
      name: 'links',
    });

    return <Tabs key={tabKey} items={items} activeItem={selectedFilter} />;
  };

  const getCurrentIndex = (id: string): number => resultsIds?.findIndex(key => key === id);

  const handleMoveUp = (id: string) => {
    if (!resultsIds) return;

    const elementIndex = getCurrentIndex(id) - 1;
    selectChild(elementIndex);
  };

  const handleMoveDown = (id: string) => {
    if (!resultsIds) return;

    const elementIndex = getCurrentIndex(id) + 1;
    selectChild(elementIndex);
  };

  const selectChild = (index: number) => {
    const selector = `#search-results [data-index="${index}"] .focusable`;
    const element = document.querySelector<HTMLDivElement>(selector);

    if (element) element.focus();
  };

  useEffect(() => {
    dispatch(fetchTrendingStatuses());
  }, []);

  let searchResults;
  let hasMore = false;
  let loaded;
  let noResultsMessage;
  let placeholderComponent = PlaceholderStatus as React.ComponentType;
  let resultsIds: Array<string>;

  if (selectedFilter === 'accounts') {
    hasMore = results.accountsHasMore;
    loaded = results.accountsLoaded;
    placeholderComponent = PlaceholderAccount;

    if (results.accounts && results.accounts.length > 0) {
      searchResults = results.accounts.map(accountId => <AccountContainer key={accountId} id={accountId} />);
    } else if (!submitted && suggestions && suggestions.length !== 0) {
      searchResults = suggestions.map(suggestion => <AccountContainer key={suggestion.account_id} id={suggestion.account_id} />);
    } else if (loaded) {
      noResultsMessage = (
        <div className='empty-column-indicator'>
          <FormattedMessage
            id='empty_column.search.accounts'
            defaultMessage='There are no people results for "{term}"'
            values={{ term: value }}
          />
        </div>
      );
    }
  }

  if (selectedFilter === 'statuses') {
    hasMore = results.statusesHasMore;
    loaded = results.statusesLoaded;

    if (results.statuses && results.statuses.length > 0) {
      searchResults = results.statuses.map((statusId: string) => (
        <StatusContainer
          key={statusId}
          id={statusId}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ));
      resultsIds = results.statuses;
    } else if (!submitted && !filterByAccount && trendingStatuses && trendingStatuses.length !== 0) {
      searchResults = trendingStatuses.map((statusId: string) => (
        <StatusContainer
          key={statusId}
          id={statusId}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ));
      resultsIds = trendingStatuses;
    } else if (loaded) {
      noResultsMessage = (
        <div className='empty-column-indicator'>
          <FormattedMessage
            id='empty_column.search.statuses'
            defaultMessage='There are no posts results for "{term}"'
            values={{ term: value }}
          />
        </div>
      );
    }
  }

  if (selectedFilter === 'hashtags') {
    hasMore = results.hashtagsHasMore;
    loaded = results.hashtagsLoaded;
    placeholderComponent = PlaceholderHashtag;

    if (results.hashtags && results.hashtags.length > 0) {
      searchResults = results.hashtags.map(hashtag => <Hashtag key={hashtag.name} hashtag={hashtag} />);
    } else if (!submitted && suggestions && suggestions.length !== 0) {
      searchResults = trends.map(hashtag => <Hashtag key={hashtag.name} hashtag={hashtag} />);
    } else if (loaded) {
      noResultsMessage = (
        <div className='empty-column-indicator'>
          <FormattedMessage
            id='empty_column.search.hashtags'
            defaultMessage='There are no hashtags results for "{term}"'
            values={{ term: value }}
          />
        </div>
      );
    }
  }

  if (selectedFilter === 'links') {
    loaded = true;

    if (submitted) {
      selectFilter('accounts');
      setTabKey(key => ++key);
    } else if (!submitted && trendingLinks) {
      searchResults = trendingLinks.map(trendingLink => <TrendingLink trendingLink={trendingLink} />);
    }
  }

  return (
    <>
      {filterByAccount ? (
        <HStack className='border-b border-solid border-gray-200 p-2 pb-4 dark:border-gray-800' space={2}>
          <IconButton iconClassName='h-5 w-5' src={require('@tabler/icons/outline/x.svg')} onClick={handleUnsetAccount} />
          <Text truncate>
            <FormattedMessage
              id='search_results.filter_message'
              defaultMessage='You are searching for posts from @{acct}.'
              values={{ acct: <strong className='break-words'>{account?.acct}</strong> }}
            />
          </Text>
        </HStack>
      ) : renderFilterBar()}

      {noResultsMessage || (
        <ScrollableList
          id='search-results'
          key={selectedFilter}
          isLoading={submitted && !loaded}
          showLoading={submitted && !loaded && (!searchResults || searchResults?.length === 0)}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          placeholderComponent={placeholderComponent}
          placeholderCount={20}
          listClassName={clsx({
            'divide-gray-200 dark:divide-gray-800 divide-solid divide-y': selectedFilter === 'statuses',
          })}
          itemClassName={clsx({
            'pb-4': selectedFilter === 'accounts' || selectedFilter === 'links',
            'pb-3': selectedFilter === 'hashtags',
          })}
        >
          {searchResults || []}
        </ScrollableList>
      )}
    </>
  );
};

export { SearchResults as default };
