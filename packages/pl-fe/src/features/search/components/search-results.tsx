import clsx from 'clsx';
import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import { useSearchAccounts, useSearchHashtags, useSearchStatuses } from 'pl-fe/api/hooks/search/use-search';
import { useTrendingLinks } from 'pl-fe/api/hooks/trends/use-trending-links';
import { useTrendingStatuses } from 'pl-fe/api/hooks/trends/use-trending-statuses';
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
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import useTrends from 'pl-fe/queries/trends';

type SearchFilter = 'accounts' | 'hashtags' | 'statuses' | 'links';

const messages = defineMessages({
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
  links: { id: 'search_results.links', defaultMessage: 'News' },
});

const SearchResults = () => {
  const intl = useIntl();
  const features = useFeatures();

  const [tabKey, setTabKey] = useState(1);

  const [params, setParams] = useSearchParams();

  const value = params.get('q') || '';
  const submitted = !!value.trim();
  const selectedFilter = (params.get('type') || 'accounts') as SearchFilter;
  const accountId = params.get('accountId') || undefined;

  const searchAccountsQuery = useSearchAccounts(selectedFilter === 'accounts' && value || '');
  const searchStatusesQuery = useSearchStatuses(selectedFilter === 'statuses' && value || '', {
    account_id: accountId,
  });
  const searchHashtagsQuery = useSearchHashtags(selectedFilter === 'hashtags' && value || '');

  const activeQuery = ({
    accounts: searchAccountsQuery,
    statuses: searchStatusesQuery,
    hashtags: searchHashtagsQuery,
    links: searchStatusesQuery,
  })[selectedFilter]!;

  const handleLoadMore = () => activeQuery.fetchNextPage({ cancelRefetch: false });

  const selectFilter = (newActiveFilter: SearchFilter) => {
    if (newActiveFilter === selectedFilter) activeQuery.refetch();
    else setParams(params => ({ ...Object.fromEntries(params.entries()), type: newActiveFilter }));
  };

  const suggestions = useAppSelector((state) => state.suggestions.items);
  const { data: trendingTags } = useTrends();
  const { data: trendingStatuses } = useTrendingStatuses();
  const { trendingLinks } = useTrendingLinks();
  const { account } = useAccount(accountId);

  const handleUnsetAccount = () => {
    params.delete('accountId');
    setParams(params => Object.fromEntries(params.entries()));
  };

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

  let searchResults: Array<JSX.Element> | undefined;
  const hasMore = activeQuery.hasNextPage;
  const isLoading = activeQuery.isFetching;
  let noResultsMessage: JSX.Element | undefined;
  let placeholderComponent = PlaceholderStatus as React.ComponentType;
  let resultsIds: Array<string>;

  if (selectedFilter === 'accounts') {
    placeholderComponent = PlaceholderAccount;

    if (searchAccountsQuery.data && searchAccountsQuery.data.length > 0) {
      searchResults = searchAccountsQuery.data.map(accountId => <AccountContainer key={accountId} id={accountId} />);
    } else if (suggestions && suggestions.length > 0) {
      searchResults = suggestions.map(suggestion => <AccountContainer key={suggestion.account_id} id={suggestion.account_id} />);
    } else if (submitted && !isLoading) {
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
    if (searchStatusesQuery.data && searchStatusesQuery.data.length > 0) {
      searchResults = searchStatusesQuery.data.map((statusId: string) => (
        // @ts-ignore
        <StatusContainer
          key={statusId}
          id={statusId}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ));
      resultsIds = searchStatusesQuery.data;
    } else if (!submitted && !accountId && trendingStatuses && trendingStatuses.length !== 0) {
      searchResults = trendingStatuses.map((statusId: string) => (
        // @ts-ignore
        <StatusContainer
          key={statusId}
          id={statusId}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ));
      resultsIds = trendingStatuses;
    } else if (submitted && !isLoading) {
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
    placeholderComponent = PlaceholderHashtag;

    if (searchHashtagsQuery.data && searchHashtagsQuery.data.length > 0) {
      searchResults = searchHashtagsQuery.data.map(hashtag => <Hashtag key={hashtag.name} hashtag={hashtag} />);
    } else if (!submitted && suggestions && suggestions.length !== 0) {
      searchResults = trendingTags?.map(hashtag => <Hashtag key={hashtag.name} hashtag={hashtag} />);
    } else if (submitted && !isLoading) {
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
    if (submitted) {
      selectFilter('accounts');
      setTabKey(key => ++key);
    } else if (trendingLinks) {
      searchResults = trendingLinks.map(trendingLink => <TrendingLink trendingLink={trendingLink} />);
    }
  }

  return (
    <>
      {accountId ? (
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
          isLoading={submitted && isLoading}
          showLoading={submitted && isLoading && (searchResults?.length === 0 || activeQuery.isRefetching)}
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
