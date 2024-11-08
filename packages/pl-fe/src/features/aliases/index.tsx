import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchAliases, removeFromAliases } from 'pl-fe/actions/aliases';
import Icon from 'pl-fe/components/icon';
import ScrollableList from 'pl-fe/components/scrollable-list';
import { CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';

import Account from './components/account';
import Search from './components/search';

const messages = defineMessages({
  heading: { id: 'column.aliases', defaultMessage: 'Account aliases' },
  subheading_add_new: { id: 'column.aliases.subheading_add_new', defaultMessage: 'Add New Alias' },
  create_error: { id: 'column.aliases.create_error', defaultMessage: 'Error creating alias' },
  delete_error: { id: 'column.aliases.delete_error', defaultMessage: 'Error deleting alias' },
  subheading_aliases: { id: 'column.aliases.subheading_aliases', defaultMessage: 'Current aliases' },
  delete: { id: 'column.aliases.delete', defaultMessage: 'Delete' },
});

const Aliases = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const { account } = useOwnAccount();

  const aliases = useAppSelector((state): Array<string> => {
    if (features.accountMoving) {
      return [...state.aliases.aliases.items];
    } else {
      return account?.__meta.pleroma?.also_known_as ?? [];
    }
  });

  const searchAccountIds = useAppSelector((state) => state.aliases.suggestions.items);
  const loaded = useAppSelector((state) => state.aliases.suggestions.loaded);

  useEffect(() => {
    dispatch(fetchAliases);
  }, []);

  const handleFilterDelete: React.MouseEventHandler<HTMLDivElement> = e => {
    dispatch(removeFromAliases(e.currentTarget.dataset.value as string));
  };

  const emptyMessage = <FormattedMessage id='empty_column.aliases' defaultMessage="You haven't created any account alias yet." />;

  return (
    <Column className='flex-1' label={intl.formatMessage(messages.heading)}>
      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.subheading_add_new)} />
      </CardHeader>
      <Search />
      {
        loaded && searchAccountIds.size === 0 ? (
          <div className='empty-column-indicator'>
            <FormattedMessage id='empty_column.aliases.suggestions' defaultMessage='There are no account suggestions available for the provided term.' />
          </div>
        ) : (
          <div className='mb-4 overflow-y-auto'>
            {searchAccountIds.map(accountId => <Account key={accountId} accountId={accountId} aliases={aliases} />)}
          </div>
        )
      }
      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.subheading_aliases)} />
      </CardHeader>
      <div className='flex-1'>
        <ScrollableList emptyMessage={emptyMessage}>
          {aliases.map((alias, i) => (
            <HStack alignItems='center' justifyContent='between' space={1} key={i} className='p-2'>
              <div>
                <Text tag='span' theme='muted'><FormattedMessage id='aliases.account_label' defaultMessage='Old account:' /></Text>
                {' '}
                <Text tag='span'>{alias}</Text>
              </div>
              <div className='flex items-center' role='button' tabIndex={0} onClick={handleFilterDelete} data-value={alias} aria-label={intl.formatMessage(messages.delete)}>
                <Icon className='mr-1.5' src={require('@tabler/icons/outline/x.svg')} />
                <Text weight='bold' theme='muted'><FormattedMessage id='aliases.aliases_list_delete' defaultMessage='Unlink alias' /></Text>
              </div>
            </HStack>
          ))}
        </ScrollableList>
      </div>
    </Column>
  );
};

export { Aliases as default };
