import clsx from 'clsx';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { useDirectory } from 'pl-fe/api/hooks/account-lists/use-directory';
import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import LoadMore from 'pl-fe/components/load-more';
import { RadioGroup, RadioItem } from 'pl-fe/components/radio';
import { CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import { useFeatures } from 'pl-fe/hooks/use-features';

import AccountCard from './components/account-card';

const messages = defineMessages({
  title: { id: 'column.directory', defaultMessage: 'Browse profiles' },
  recentlyActive: { id: 'directory.recently_active', defaultMessage: 'Recently active' },
  newArrivals: { id: 'directory.new_arrivals', defaultMessage: 'New arrivals' },
  local: { id: 'directory.local', defaultMessage: 'From {domain} only' },
  federated: { id: 'directory.federated', defaultMessage: 'From known fediverse' },
});

const Directory = () => {
  const intl = useIntl();
  const [params, setParams] = useSearchParams();
  const { data: instance } = useInstance();
  const features = useFeatures();

  const order = (params.get('order') || 'active') as 'active' | 'new';
  const local = !!params.get('local');

  const { data: accountIds = [], isLoading, hasNextPage, fetchNextPage } = useDirectory(order, local);

  const handleChangeOrder: React.ChangeEventHandler<HTMLInputElement> = e => {
    setParams({ local: local ? 'true' : '', order: e.target.value });
  };

  const handleChangeLocal: React.ChangeEventHandler<HTMLInputElement> = e => {
    setParams({ local: e.target.value === '1' ? 'true' : '', order });
  };

  const handleLoadMore = () => {
    fetchNextPage({ cancelRefetch: false });
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Stack space={4}>
        <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
          <Stack space={2}>
            <CardTitle title={<FormattedMessage id='directory.display_filter' defaultMessage='Display filter' />} />

            <RadioGroup onChange={handleChangeOrder}>
              <RadioItem
                label={intl.formatMessage(messages.recentlyActive)}
                checked={order === 'active'}
                value='active'
              />
              <RadioItem
                label={intl.formatMessage(messages.newArrivals)}
                checked={order === 'new'}
                value='new'
              />
            </RadioGroup>
          </Stack>

          {features.federating && (
            <Stack space={2}>
              <CardTitle title={<FormattedMessage id='directory.fediverse_filter' defaultMessage='Fediverse filter' />} />

              <RadioGroup onChange={handleChangeLocal}>
                <RadioItem
                  label={intl.formatMessage(messages.local, { domain: instance.title })}
                  checked={local}
                  value='1'
                />
                <RadioItem
                  label={intl.formatMessage(messages.federated)}
                  checked={!local}
                  value='0'
                />
              </RadioGroup>
            </Stack>
          )}
        </div>

        <div
          className={
            clsx({
              'grid grid-cols-1 sm:grid-cols-2 gap-2.5': true,
              'opacity-30': isLoading,
            })
          }
        >
          {accountIds.map((accountId) => (
            <AccountCard id={accountId} key={accountId} />),
          )}
        </div>

        {hasNextPage && <LoadMore onClick={handleLoadMore} disabled={isLoading} />}
      </Stack>
    </Column>
  );
};

export { Directory as default };
