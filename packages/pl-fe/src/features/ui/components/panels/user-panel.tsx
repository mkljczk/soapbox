import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from '@tanstack/react-router';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import StillImage from 'pl-fe/components/still-image';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import VerificationBadge from 'pl-fe/components/verification-badge';
import Emojify from 'pl-fe/features/emoji/emojify';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { getAcct } from 'pl-fe/utils/accounts';
import { shortNumberFormat } from 'pl-fe/utils/numbers';
import { displayFqn } from 'pl-fe/utils/state';

interface IUserPanel {
  accountId: string;
  action?: JSX.Element;
  badges?: JSX.Element[];
  domain?: string;
}

const UserPanel: React.FC<IUserPanel> = ({ accountId, action, badges, domain }) => {
  const intl = useIntl();
  const { demetricator } = useSettings();
  const { account } = useAccount(accountId);
  const fqn = useAppSelector((state) => displayFqn(state));

  if (!account) return null;
  const acct = !account.acct.includes('@') && domain ? `${account.acct}@${domain}` : account.acct;
  const header = account.header;
  const verified = account.verified;

  return (
    <div className='relative'>
      <Stack space={2}>
        <Stack>
          <div className='relative -mx-4 -mt-4 h-24 overflow-hidden bg-gray-200'>
            {header && (
              <StillImage src={account.header} alt={account.header_description} />
            )}
          </div>

          <HStack justifyContent='between'>
            <Link
              to={`/@${account.acct}`}
              title={acct}
              className='-mt-12 block'
            >
              <Avatar
                src={account.avatar}
                alt={account.avatar_description}
                size={80}
                className='size-20 overflow-hidden bg-gray-50 ring-2 ring-white'
              />
            </Link>

            {action && (
              <div className='mt-2'>{action}</div>
            )}
          </HStack>
        </Stack>

        <Stack>
          <Link to={`/@${account.acct}`}>
            <HStack space={1} alignItems='center'>
              <Text size='lg' weight='bold' truncate>
                <Emojify text={account.display_name} emojis={account.emojis} />
              </Text>

              {verified && <VerificationBadge />}

              {badges && badges.length > 0 && (
                <HStack space={1} alignItems='center'>
                  {badges}
                </HStack>
              )}
            </HStack>
          </Link>

          <HStack>
            <Text size='sm' theme='muted' direction='ltr' truncate>
              @{getAcct(account, fqn)}
            </Text>
          </HStack>
        </Stack>

        {!demetricator && (
          <HStack alignItems='center' space={3}>
            {account.followers_count >= 0 && (
              <Link to={`/@${account.acct}/followers`} title={intl.formatNumber(account.followers_count)}>
                <HStack alignItems='center' space={1}>
                  <Text theme='primary' weight='bold' size='sm'>
                    {shortNumberFormat(account.followers_count)}
                  </Text>
                  <Text weight='bold' size='sm'>
                    <FormattedMessage id='account.followers' defaultMessage='Followers' />
                  </Text>
                </HStack>
              </Link>
            )}

            {account.following_count >= 0 && (
              <Link to={`/@${account.acct}/following`} title={intl.formatNumber(account.following_count)}>
                <HStack alignItems='center' space={1}>
                  <Text theme='primary' weight='bold' size='sm'>
                    {shortNumberFormat(account.following_count)}
                  </Text>
                  <Text weight='bold' size='sm'>
                    <FormattedMessage id='account.follows' defaultMessage='Following' />
                  </Text>
                </HStack>
              </Link>
            )}
          </HStack>
        )}
      </Stack>
    </div>
  );
};

export { UserPanel as default };
