import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { fetchAccount } from 'pl-fe/actions/accounts';
import { addToMentions, removeFromMentions } from 'pl-fe/actions/compose';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import AccountComponent from 'pl-fe/components/account';
import IconButton from 'pl-fe/components/icon-button';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';

const messages = defineMessages({
  remove: { id: 'reply_mentions.account.remove', defaultMessage: 'Remove from mentions' },
  add: { id: 'reply_mentions.account.add', defaultMessage: 'Add to mentions' },
});

interface IAccount {
  composeId: string;
  accountId: string;
  author: boolean;
}

const Account: React.FC<IAccount> = ({ composeId, accountId, author }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);
  const { account } = useAccount(accountId);
  const added = !!account && compose.to?.includes(account.acct);

  const onRemove = () => dispatch(removeFromMentions(composeId, accountId));
  const onAdd = () => dispatch(addToMentions(composeId, accountId));

  useEffect(() => {
    if (accountId && !account) {
      dispatch(fetchAccount(accountId));
    }
  }, []);

  if (!account) return null;

  let button;

  if (added) {
    button = <IconButton src={require('@fluentui/dismiss_24_regular.svg')} iconClassName='h-5 w-5' title={intl.formatMessage(messages.remove)} onClick={onRemove} />;
  } else {
    button = <IconButton src={require('@tabler/icons/outline/plus.svg')} iconClassName='h-5 w-5' title={intl.formatMessage(messages.add)} onClick={onAdd} />;
  }

  return (
    <div className='p-2'>
      <AccountComponent account={account} withRelationship={false} withLinkToProfile={false} action={author ? undefined : button} />
    </div>
  );
};

export { Account as default };
