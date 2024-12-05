import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useEndorsedAccounts } from 'pl-fe/api/hooks/account-lists/use-endorsed-accounts';
import Widget from 'pl-fe/components/ui/widget';
import AccountContainer from 'pl-fe/containers/account-container';
import Emojify from 'pl-fe/features/emoji/emojify';
import { WhoToFollowPanel } from 'pl-fe/features/ui/util/async-components';

import type { Account } from 'pl-fe/normalizers/account';

interface IPinnedAccountsPanel {
  account: Pick<Account, 'id' | 'display_name' | 'emojis'>;
  limit: number;
}

const PinnedAccountsPanel: React.FC<IPinnedAccountsPanel> = ({ account, limit }) => {
  const { data: pinned = [] } = useEndorsedAccounts(account.id);

  if (!pinned.length) {
    return (
      <WhoToFollowPanel limit={limit} />
    );
  }

  return (
    <Widget
      title={<FormattedMessage
        id='pinned_accounts.title'
        defaultMessage='{name}’s choices'
        values={{
          name: <span><Emojify text={account.display_name} emojis={account.emojis} /></span>,
        }}
      />}
    >
      {pinned && pinned.map((suggestion) => (
        <AccountContainer
          key={suggestion}
          id={suggestion}
          withRelationship={false}
        />
      ))}
    </Widget>
  );
};

export { PinnedAccountsPanel as default };
