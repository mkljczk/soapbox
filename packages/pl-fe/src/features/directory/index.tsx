import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

import { fetchDirectory, expandDirectory } from 'pl-fe/actions/directory';
import LoadMore from 'pl-fe/components/load-more';
import { RadioGroup, RadioItem } from 'pl-fe/components/radio';
import { CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';

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
  const dispatch = useAppDispatch();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const instance = useInstance();
  const features = useFeatures();

  const accountIds = useAppSelector((state) => state.user_lists.directory.items);
  const isLoading = useAppSelector((state) => state.user_lists.directory.isLoading);

  const [order, setOrder] = useState(params.get('order') || 'active');
  const [local, setLocal] = useState(!!params.get('local'));

  useEffect(() => {
    dispatch(fetchDirectory({ order: order || 'active', local: local || false }));
  }, [order, local]);

  const handleChangeOrder: React.ChangeEventHandler<HTMLInputElement> = e => {
    setOrder(e.target.value);
  };

  const handleChangeLocal: React.ChangeEventHandler<HTMLInputElement> = e => {
    setLocal(e.target.value === '1');
  };

  const handleLoadMore = () => {
    dispatch(expandDirectory({ order: order || 'active', local: local || false }));
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

        <LoadMore onClick={handleLoadMore} disabled={isLoading} />
      </Stack>
    </Column>
  );
};

export { Directory as default };
