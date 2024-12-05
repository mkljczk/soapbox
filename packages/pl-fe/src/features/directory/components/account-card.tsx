import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import Account from 'pl-fe/components/account';
import Badge from 'pl-fe/components/badge';
import HoverAccountWrapper from 'pl-fe/components/hover-account-wrapper';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import RelativeTimestamp from 'pl-fe/components/relative-timestamp';
import Avatar from 'pl-fe/components/ui/avatar';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import ActionButton from 'pl-fe/features/ui/components/action-button';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { shortNumberFormat } from 'pl-fe/utils/numbers';

interface IAccountCard {
  id: string;
}

const AccountCard: React.FC<IAccountCard> = ({ id }) => {
  const me = useAppSelector((state) => state.me);
  const { account } = useAccount(id);
  const { autoPlayGif } = useSettingsStore().settings;

  if (!account) return null;

  const followedBy = me !== account.id && account.relationship?.followed_by;

  return (
    <div className='dark:divide-primary-700 dark:bg-primary-800 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow'>
      <div className='relative'>
        {followedBy && (
          <div className='absolute left-2.5 top-2.5'>
            <Badge
              slug='opaque'
              title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
            />
          </div>
        )}

        <div className='absolute bottom-0 right-3 translate-y-1/2'>
          <ActionButton account={account} small />
        </div>

        <img
          src={autoPlayGif ? account.header : account.header_static}
          alt={account.header_description}
          className='h-32 w-full rounded-t-lg object-cover'
        />

        <HoverAccountWrapper key={account.id} accountId={account.id} element='span'>
          <Link to={`/@${account.acct}`} title={account.acct}>
            <Avatar
              src={account.avatar}
              alt={account.avatar_description}
              className='dark:bg-primary-900 dark:ring-primary-900 !absolute bottom-0 left-3 translate-y-1/2 bg-white ring-2 ring-white'
              size={64}
            />
          </Link>
        </HoverAccountWrapper>
      </div>

      <Stack space={4} className='p-3 pt-10'>
        <Account
          account={account}
          withAvatar={false}
          withRelationship={false}
        />

        {!!account.note && (
          <Text
            truncate
            align='left'
            className='line-clamp-2 inline text-ellipsis [&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden'
          >
            <ParsedContent html={account.note} emojis={account.emojis} />
          </Text>
        )}
      </Stack>

      <div className='grid grid-cols-3 gap-1 py-4'>
        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {shortNumberFormat(account.statuses_count)}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.posts' defaultMessage='Posts' />
          </Text>
        </Stack>

        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {shortNumberFormat(account.followers_count)}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.followers' defaultMessage='Followers' />
          </Text>
        </Stack>

        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {account.last_status_at ? (
              <RelativeTimestamp theme='inherit' timestamp={account.last_status_at} />
            ) : (
              <FormattedMessage id='account.never_active' defaultMessage='Never' />
            )}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.last_status' defaultMessage='Last active' />
          </Text>
        </Stack>
      </div>
    </div>
  );
};

export { AccountCard as default };
