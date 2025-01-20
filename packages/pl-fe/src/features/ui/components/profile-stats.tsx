import { Link } from '@tanstack/react-router';
import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import HStack from 'pl-fe/components/ui/hstack';
import Text from 'pl-fe/components/ui/text';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { shortNumberFormat } from 'pl-fe/utils/numbers';

import type { Account } from 'pl-fe/normalizers/account';

const messages = defineMessages({
  followers: { id: 'account.followers', defaultMessage: 'Followers' },
  follows: { id: 'account.follows', defaultMessage: 'Following' },
  statuses: { id: 'account.statuses', defaultMessage: 'Statuses' },
});

interface IProfileStats {
  account: Pick<Account, 'acct' | 'followers_count' | 'following_count' | 'statuses_count'> | undefined;
  onClickHandler?: React.MouseEventHandler;
}

/** Display follower and following counts for an account. */
const ProfileStats: React.FC<IProfileStats> = ({ account, onClickHandler }) => {
  const intl = useIntl();
  const { demetricator } = useSettings();

  if (!account) {
    return null;
  }

  return (
    <HStack alignItems='center' className='gap-x-3' wrap>
      {!demetricator && (
        <HStack alignItems='center' space={1}>
          <Text theme='primary' weight='bold' size='sm'>
            {shortNumberFormat(account.statuses_count)}
          </Text>
          <Text weight='bold' size='sm'>
            {intl.formatMessage(messages.statuses)}
          </Text>
        </HStack>
      )}

      <Link to={`/@${account.acct}/followers`} onClick={onClickHandler} title={intl.formatNumber(account.followers_count)} className='hover:underline'>
        <HStack alignItems='center' space={1}>
          {!demetricator && (
            <Text theme='primary' weight='bold' size='sm'>
              {shortNumberFormat(account.followers_count)}
            </Text>
          )}
          <Text weight='bold' size='sm'>
            {intl.formatMessage(messages.followers)}
          </Text>
        </HStack>
      </Link>

      <Link to={`/@${account.acct}/following`} onClick={onClickHandler} title={intl.formatNumber(account.following_count)} className='hover:underline'>
        <HStack alignItems='center' space={1}>
          {!demetricator && (
            <Text theme='primary' weight='bold' size='sm'>
              {shortNumberFormat(account.following_count)}
            </Text>
          )}
          <Text weight='bold' size='sm'>
            {intl.formatMessage(messages.follows)}
          </Text>
        </HStack>
      </Link>
    </HStack>
  );
};

export { ProfileStats as default };
