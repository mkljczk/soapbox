import React, { useEffect } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { createSelector } from 'reselect';

import { fetchLists } from 'pl-fe/actions/lists';
import List, { ListItem } from 'pl-fe/components/list';
import Card from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import NewListForm from './components/new-list-form';

import type { List as ListEntity } from 'pl-api';
import type { RootState } from 'pl-fe/store';

const messages = defineMessages({
  heading: { id: 'column.lists', defaultMessage: 'Lists' },
  subheading: { id: 'lists.subheading', defaultMessage: 'Your lists' },
});

const getOrderedLists = createSelector([(state: RootState) => state.lists], lists => {
  if (!lists) {
    return lists;
  }

  return lists.toList().filter((item): item is ListEntity => !!item).sort((a, b) => a.title.localeCompare(b.title));
});

const Lists: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const lists = useAppSelector((state) => getOrderedLists(state));

  useEffect(() => {
    dispatch(fetchLists());
  }, []);

  if (!lists) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = <FormattedMessage id='empty_column.lists' defaultMessage="You don't have any lists yet. When you create one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <NewListForm />

        {lists.isEmpty() ? (
          <Card variant='rounded' size='lg'>
            {emptyMessage}
          </Card>
        ) : (
          <List>
            {lists.map((list: any) => (
              <ListItem
                key={list.id}
                to={`/list/${list.id}`}
                label={
                  <HStack alignItems='center' space={2}>
                    <Icon src={require('@tabler/icons/outline/list.svg')} size={20} />
                    <span>{list.title}</span>
                  </HStack>
                }
              />
            ))}
          </List>
        )}
      </Stack>
    </Column>
  );
};

export { Lists as default, getOrderedLists };
