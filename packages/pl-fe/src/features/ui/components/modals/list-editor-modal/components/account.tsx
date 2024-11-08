import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { removeFromListEditor, addToListEditor } from 'pl-fe/actions/lists';
import IconButton from 'pl-fe/components/icon-button';
import HStack from 'pl-fe/components/ui/hstack';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

const messages = defineMessages({
  remove: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  add: { id: 'lists.account.add', defaultMessage: 'Add to list' },
});

interface IAccount {
  accountId: string;
}

const Account: React.FC<IAccount> = ({ accountId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const isAdded = useAppSelector((state) => state.listEditor.accounts.items.includes(accountId));

  const onRemove = () => dispatch(removeFromListEditor(accountId));
  const onAdd = () => dispatch(addToListEditor(accountId));

  let button;

  if (isAdded) {
    button = <IconButton src={require('@fluentui/dismiss_24_regular.svg')} iconClassName='h-5 w-5' title={intl.formatMessage(messages.remove)} onClick={onRemove} />;
  } else {
    button = <IconButton src={require('@fluentui/add_24_regular.svg')} iconClassName='h-5 w-5' title={intl.formatMessage(messages.add)} onClick={onAdd} />;
  }

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <AccountContainer id={accountId} withRelationship={false} />
      </div>
      {button}
    </HStack>
  );
};

export { Account as default };
