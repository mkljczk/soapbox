import { autoUpdate, flip, shift, useFloating, useTransitionStyles } from '@floating-ui/react';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchRelationships } from 'pl-fe/actions/accounts';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import Badge from 'pl-fe/components/badge';
import Card, { CardBody } from 'pl-fe/components/ui/card';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import ActionButton from 'pl-fe/features/ui/components/action-button';
import { UserPanel } from 'pl-fe/features/ui/util/async-components';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useAccountHoverCardStore } from 'pl-fe/stores/account-hover-card';

import { showAccountHoverCard } from './hover-account-wrapper';
import { ParsedContent } from './parsed-content';
import { dateFormatOptions } from './relative-timestamp';
import Scrobble from './scrobble';

import type { Account } from 'pl-fe/normalizers/account';

const getBadges = (
  account?: Pick<Account, 'is_admin' | 'is_moderator'>,
): JSX.Element[] => {
  const badges = [];

  if (account?.is_admin) {
    badges.push(<Badge key='admin' slug='admin' title={<FormattedMessage id='account_moderation_modal.roles.admin' defaultMessage='Admin' />} />);
  } else if (account?.is_moderator) {
    badges.push(<Badge key='moderator' slug='moderator' title={<FormattedMessage id='account_moderation_modal.roles.moderator' defaultMessage='Moderator' />} />);
  }

  return badges;
};

interface IAccountHoverCard {
  visible?: boolean;
}

/** Popup profile preview that appears when hovering avatars and display names. */
const AccountHoverCard: React.FC<IAccountHoverCard> = ({ visible = true }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();

  const { accountId, ref, updateAccountHoverCard, closeAccountHoverCard } = useAccountHoverCardStore();

  const me = useAppSelector(state => state.me);
  const { account } = useAccount(accountId || undefined, { withRelationship: true, withScrobble: true });
  const badges = getBadges(account);

  useEffect(() => {
    if (accountId) dispatch(fetchRelationships([accountId]));
  }, [dispatch, accountId]);

  useEffect(() => {
    const unlisten = history.listen(() => {
      showAccountHoverCard.cancel();
      closeAccountHoverCard(true);
    });

    return () => {
      unlisten();
    };
  }, []);

  const { x, y, strategy, refs, context, placement } = useFloating({
    open: !!account,
    elements: {
      reference: ref?.current,
    },
    middleware: [
      flip(),
      shift({
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { styles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.8)',
      transformOrigin: placement === 'bottom' ? 'top' : 'bottom',
    },
    duration: {
      open: 100,
      close: 100,
    },
  });

  const handleMouseEnter = () => {
    updateAccountHoverCard();
  };

  const handleMouseLeave = () => {
    closeAccountHoverCard(true);
  };

  if (!account) return null;
  const memberSinceDate = intl.formatDate(account.created_at, { month: 'long', year: 'numeric' });
  const followedBy = me !== account.id && account.relationship?.followed_by === true;

  return (
    <div
      className={clsx({
        'absolute transition-opacity w-[320px] z-[101] top-0 left-0': true,
        'opacity-100': visible,
        'opacity-0 pointer-events-none': !visible,
      })}
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        ...styles,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card variant='rounded' className='relative isolate overflow-hidden black:rounded-xl black:border black:border-gray-800'>
        <CardBody>
          <Stack space={2}>
            <UserPanel
              accountId={account.id}
              action={<ActionButton account={account} small />}
              badges={badges}
            />

            {account.local ? (
              <HStack alignItems='center' space={0.5}>
                <Icon
                  src={require('@tabler/icons/outline/calendar.svg')}
                  className='size-4 text-gray-800 dark:text-gray-200'
                />

                <Text size='sm' title={intl.formatDate(account.created_at, dateFormatOptions)}>
                  <FormattedMessage
                    id='account.member_since' defaultMessage='Joined {date}' values={{
                      date: memberSinceDate,
                    }}
                  />
                </Text>
              </HStack>
            ) : null}

            {!!account.scrobble && (
              <Scrobble scrobble={account.scrobble} />
            )}

            {account.note.length > 0 && (
              <Text
                truncate
                size='sm'
                className='mr-2 rtl:ml-2 rtl:mr-0 [&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden'
              >
                <ParsedContent html={account.note} emojis={account.emojis} />
              </Text>
            )}
          </Stack>

          {followedBy && (
            <div className='absolute left-2 top-2'>
              <Badge
                slug='opaque'
                title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export { AccountHoverCard as default };
