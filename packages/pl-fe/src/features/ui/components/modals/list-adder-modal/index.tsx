import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createSelector } from 'reselect';

import { setupListAdder, resetListAdder } from 'pl-fe/actions/lists';
import { CardHeader, CardTitle, Modal } from 'pl-fe/components/ui';
import AccountContainer from 'pl-fe/containers/account-container';
import NewListForm from 'pl-fe/features/lists/components/new-list-form';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';

import List from './components/list';

import type { List as ImmutableList } from 'immutable';
import type { List as ListEntity } from 'pl-api';
import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';
import type { RootState } from 'pl-fe/store';

const messages = defineMessages({
  subheading: { id: 'lists.subheading', defaultMessage: 'Your lists' },
  add: { id: 'lists.new.create', defaultMessage: 'Add list' },
});

// hack
const getOrderedLists = createSelector([(state: RootState) => state.lists], lists => {
  if (!lists) {
    return lists;
  }

  return lists.toList().filter(item => !!item).sort((a, b) => (a as ListEntity).title.localeCompare((b as ListEntity).title)) as ImmutableList<ListEntity>;
});

interface ListAdderModalProps {
  accountId: string;
}

const ListAdderModal: React.FC<BaseModalProps & ListAdderModalProps> = ({ accountId, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const listIds = useAppSelector((state) => getOrderedLists(state).map(list => list.id));

  useEffect(() => {
    dispatch(setupListAdder(accountId));

    return () => {
      dispatch(resetListAdder());
    };
  }, []);

  const onClickClose = () => {
    onClose('LIST_ADDER');
  };

  return (
    <Modal
      title={<FormattedMessage id='list_adder.header_title' defaultMessage='Add or Remove from Lists' />}
      onClose={onClickClose}
    >
      <AccountContainer id={accountId} withRelationship={false} />

      <br />

      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.add)} />
      </CardHeader>
      <NewListForm />

      <br />

      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.subheading)} />
      </CardHeader>
      <div>
        {listIds.map(ListId => <List key={ListId} listId={ListId} />)}
      </div>
    </Modal>
  );
};

export { type ListAdderModalProps, ListAdderModal as default };
