import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { removeFromListAdder, addToListAdder } from 'pl-fe/actions/lists';
import Icon from 'pl-fe/components/icon';
import IconButton from 'pl-fe/components/icon-button';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

const messages = defineMessages({
  remove: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  add: { id: 'lists.account.add', defaultMessage: 'Add to list' },
});

interface IList {
  listId: string;
}

const List: React.FC<IList> = ({ listId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const list = useAppSelector((state) => state.lists.get(listId));
  const added = useAppSelector((state) => state.listAdder.lists.items.includes(listId));

  const onRemove = () => dispatch(removeFromListAdder(listId));
  const onAdd = () => dispatch(addToListAdder(listId));

  if (!list) return null;

  let button;

  if (added) {
    button = <IconButton iconClassName='h-5 w-5' src={require('@tabler/icons/outline/x.svg')} title={intl.formatMessage(messages.remove)} onClick={onRemove} />;
  } else {
    button = <IconButton iconClassName='h-5 w-5' src={require('@tabler/icons/outline/plus.svg')} title={intl.formatMessage(messages.add)} onClick={onAdd} />;
  }

  return (
    <div className='flex items-center gap-1.5 px-2 py-4 text-black dark:text-white'>
      <Icon src={require('@fluentui/people_24_regular.svg')} />
      <span className='grow'>
        {list.title}
      </span>
      {button}
    </div>
  );
};

export { List as default };
