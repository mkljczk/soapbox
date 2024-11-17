import debounce from 'lodash/debounce';
import React, { useCallback, useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchAccount, fetchAccountByUsername } from 'pl-fe/actions/accounts';
import { fetchFavouritedStatuses, expandFavouritedStatuses, fetchAccountFavouritedStatuses, expandAccountFavouritedStatuses } from 'pl-fe/actions/favourites';
import { useAccountLookup } from 'pl-fe/api/hooks/accounts/use-account-lookup';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import StatusList from 'pl-fe/components/status-list';
import Column from 'pl-fe/components/ui/column';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';

const messages = defineMessages({
  heading: { id: 'column.favourited_statuses', defaultMessage: 'Liked posts' },
});

interface IFavourites {
  params?: {
    username?: string;
  };
}

/** Timeline displaying a user's favourited statuses. */
const Favourites: React.FC<IFavourites> = ({ params }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account: ownAccount } = useOwnAccount();
  const { account, isUnavailable } = useAccountLookup(params?.username, { withRelationship: true });

  const username = params?.username || '';
  const isOwnAccount = username.toLowerCase() === ownAccount?.acct?.toLowerCase();

  const timelineKey = isOwnAccount ? 'favourites' : `favourites:${account?.id}`;
  const statusIds = useAppSelector(state => state.status_lists[timelineKey]?.items || []);
  const isLoading = useAppSelector(state => state.status_lists[timelineKey]?.isLoading === true);
  const hasMore = useAppSelector(state => !!state.status_lists[timelineKey]?.next);

  const handleLoadMore = useCallback(debounce(() => {
    if (isOwnAccount) {
      dispatch(expandFavouritedStatuses());
    } else if (account) {
      dispatch(expandAccountFavouritedStatuses(account.id));
    }
  }, 300, { leading: true }), [account?.id]);

  useEffect(() => {
    if (isOwnAccount)
      dispatch(fetchFavouritedStatuses());
    else {
      if (account) {
        dispatch(fetchAccount(account.id));
        dispatch(fetchAccountFavouritedStatuses(account.id));
      } else {
        dispatch(fetchAccountByUsername(username));
      }
    }
  }, []);

  useEffect(() => {
    if (account && !isOwnAccount) {
      dispatch(fetchAccount(account.id));
      dispatch(fetchAccountFavouritedStatuses(account.id));
    }
  }, [account?.id]);

  if (isUnavailable) {
    return (
      <Column>
        <div className='empty-column-indicator'>
          <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' />
        </div>
      </Column>
    );
  }

  if (!account) {
    return (
      <MissingIndicator />
    );
  }

  const emptyMessage = isOwnAccount
    ? <FormattedMessage id='empty_column.favourited_statuses' defaultMessage="You don't have any liked posts yet. When you like one, it will show up here." />
    : <FormattedMessage id='empty_column.account_favourited_statuses' defaultMessage="This user doesn't have any liked posts yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader={false} transparent>
      <StatusList
        statusIds={statusIds}
        scrollKey='favourited_statuses'
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        emptyMessage={emptyMessage}
      />
    </Column>
  );
};

export { Favourites as default };
