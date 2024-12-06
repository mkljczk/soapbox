import clsx from 'clsx';
import React, { useCallback, useState } from 'react';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import VerificationBadge from 'pl-fe/components/verification-badge';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useAccountSearch } from 'pl-fe/queries/search/use-search-accounts';
import { selectAccounts } from 'pl-fe/selectors';

import type { Account } from 'pl-api';

interface IResults {
  accountSearchResult: ReturnType<typeof useAccountSearch>;
  onSelect(id: string): void;
  parentRef: React.RefObject<HTMLElement>;
}

const Results = ({ accountSearchResult, onSelect, parentRef }: IResults) => {
  const { data: accountIds = [], isFetching, hasNextPage, fetchNextPage } = accountSearchResult;
  const accounts = useAppSelector((state) => selectAccounts(state, accountIds));

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const renderAccount = useCallback((account: Account) => (
    <button
      key={account.id}
      type='button'
      className='flex w-full flex-col rounded-lg px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-800'
      onClick={() => onSelect(account.id)}
      data-testid='account'
    >
      <HStack alignItems='center' space={2}>
        <Avatar src={account.avatar} alt={account.avatar_description} size={40} />

        <Stack alignItems='start'>
          <div className='flex grow items-center space-x-1'>
            <Text weight='bold' size='sm' truncate>{account.display_name}</Text>
            {account.verified && <VerificationBadge />}
          </div>
          <Text size='sm' weight='medium' theme='muted' direction='ltr' truncate>@{account.acct}</Text>
        </Stack>
      </HStack>
    </button>
  ), []);

  // <div className='relative grow'>
  return (
    <>
      <ScrollableList
        itemClassName='px-2'
        loadMoreClassName='mx-4 mb-4'
        onScroll={(startIndex, endIndex) => {
          setNearTop(startIndex === 0);
          setNearBottom(endIndex === accounts?.length);
        }}
        isLoading={isFetching}
        hasMore={hasNextPage}
        onLoadMore={handleLoadMore}
        parentRef={parentRef}
      >
        {(accounts || []).map((chat) => renderAccount(chat))}
      </ScrollableList>

      <div
        className={clsx('pointer-events-none absolute inset-x-0 top-[58px] flex justify-center rounded-t-lg bg-gradient-to-b from-white to-transparent pb-12 pt-8 transition-opacity duration-500 black:from-black dark:from-gray-900', {
          'opacity-0': isNearTop,
          'opacity-100': !isNearTop,
        })}
      />
      <div
        className={clsx('pointer-events-none absolute inset-x-0 bottom-0 flex justify-center rounded-b-lg bg-gradient-to-t from-white to-transparent pb-8 pt-12 transition-opacity duration-500 black:from-black dark:from-gray-900', {
          'opacity-0': isNearBottom,
          'opacity-100': !isNearBottom,
        })}
      />
    </>
  );
};

export { Results as default };
