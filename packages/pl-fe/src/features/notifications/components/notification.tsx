import React, { useCallback } from 'react';
import { defineMessages, useIntl, FormattedList, FormattedMessage, IntlShape, MessageDescriptor } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { mentionCompose } from 'pl-fe/actions/compose';
import { reblog, favourite, unreblog, unfavourite } from 'pl-fe/actions/interactions';
import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import HoverAccountWrapper from 'pl-fe/components/hover-account-wrapper';
import Icon from 'pl-fe/components/icon';
import RelativeTimestamp from 'pl-fe/components/relative-timestamp';
import Emoji from 'pl-fe/components/ui/emoji';
import HStack from 'pl-fe/components/ui/hstack';
import Text from 'pl-fe/components/ui/text';
import AccountContainer from 'pl-fe/containers/account-container';
import StatusContainer from 'pl-fe/containers/status-container';
import Emojify from 'pl-fe/features/emoji/emojify';
import { HotKeys } from 'pl-fe/features/ui/components/hotkeys';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { makeGetNotification } from 'pl-fe/selectors';
import { useModalsStore } from 'pl-fe/stores/modals';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { useStatusMetaStore } from 'pl-fe/stores/status-meta';
import { NotificationType } from 'pl-fe/utils/notification';

import type { NotificationGroup } from 'pl-api';
import type { Account } from 'pl-fe/normalizers/account';
import type { Status as StatusEntity } from 'pl-fe/normalizers/status';

const notificationForScreenReader = (intl: IntlShape, message: string, timestamp: string) => {
  const output = [message];

  output.push(intl.formatDate(timestamp, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }));

  return output.join(', ');
};

const buildLink = (account: Pick<Account, 'acct' | 'display_name' | 'emojis' | 'id'>): JSX.Element => (
  <HoverAccountWrapper key={account.acct} element='bdi' accountId={account.id}>
    <Link
      className='font-bold text-gray-800 hover:underline dark:text-gray-200'
      title={account.acct}
      to={`/@${account.acct}`}
    >
      <Emojify text={account.display_name} emojis={account.emojis} />
    </Link>
  </HoverAccountWrapper>
);

const icons: Partial<Record<NotificationType | 'reply', string>> = {
  follow: require('@tabler/icons/outline/user-plus.svg'),
  follow_request: require('@tabler/icons/outline/user-plus.svg'),
  mention: require('@tabler/icons/outline/at.svg'),
  favourite: require('@tabler/icons/outline/star.svg'),
  reblog: require('@tabler/icons/outline/repeat.svg'),
  status: require('@tabler/icons/outline/bell-ringing.svg'),
  poll: require('@tabler/icons/outline/chart-bar.svg'),
  move: require('@tabler/icons/outline/briefcase.svg'),
  chat_mention: require('@tabler/icons/outline/messages.svg'),
  emoji_reaction: require('@tabler/icons/outline/mood-happy.svg'),
  update: require('@tabler/icons/outline/pencil.svg'),
  event_reminder: require('@tabler/icons/outline/calendar-time.svg'),
  participation_request: require('@tabler/icons/outline/calendar-event.svg'),
  participation_accepted: require('@tabler/icons/outline/calendar-event.svg'),
  bite: require('@tabler/icons/outline/pacman.svg'),
  reply: require('@tabler/icons/outline/corner-up-left.svg'),
};

const messages: Record<NotificationType | 'reply', MessageDescriptor> = defineMessages({
  follow: {
    id: 'notification.follow',
    defaultMessage: '{name} followed you',
  },
  follow_request: {
    id: 'notification.follow_request',
    defaultMessage: '{name} has requested to follow you',
  },
  mention: {
    id: 'notification.mention',
    defaultMessage: '{name} mentioned you',
  },
  favourite: {
    id: 'notification.favourite',
    defaultMessage: '{name} liked your post',
  },
  reblog: {
    id: 'notification.reblog',
    defaultMessage: '{name} reposted your post',
  },
  status: {
    id: 'notification.status',
    defaultMessage: '{name} just posted',
  },
  poll: {
    id: 'notification.poll',
    defaultMessage: 'A poll you have voted in has ended',
  },
  move: {
    id: 'notification.move',
    defaultMessage: '{name} moved to {targetName}',
  },
  chat_mention: {
    id: 'notification.pleroma:chat_mention',
    defaultMessage: '{name} sent you a message',
  },
  emoji_reaction: {
    id: 'notification.pleroma:emoji_reaction',
    defaultMessage: '{name} reacted to your post',
  },
  update: {
    id: 'notification.update',
    defaultMessage: '{name} edited a post you interacted with',
  },
  event_reminder: {
    id: 'notification.pleroma:event_reminder',
    defaultMessage: 'An event you are participating in starts soon',
  },
  participation_request: {
    id: 'notification.pleroma:participation_request',
    defaultMessage: '{name} wants to join your event',
  },
  participation_accepted: {
    id: 'notification.pleroma:participation_accepted',
    defaultMessage: 'You were accepted to join the event',
  },
  'admin.sign_up': {
    id: 'notification.admin.sign_up',
    defaultMessage: '{name} signed up',
  },
  'admin.report': {
    id: 'notification.admin.report',
    defaultMessage: '{name} reported {target}',
  },
  severed_relationships: {
    id: 'notification.severed_relationships',
    defaultMessage: 'Lost connections with {name}',
  },
  moderation_warning: {
    id: 'notification.moderation_warning',
    defaultMessage: 'You have received a moderation warning',
  },
  bite: {
    id: 'notification.bite',
    defaultMessage: '{name} has bit you',
  },
  reply: {
    id: 'notification.reply',
    defaultMessage: '{name} replied to your post',
  },
});

const buildMessage = (
  intl: IntlShape,
  type: NotificationType | 'reply',
  accounts: Array<Pick<Account, 'acct' | 'display_name' | 'emojis' | 'id'>>,
  targetName: string,
  instanceTitle: string,
): React.ReactNode => {
  const renderedAccounts = accounts.slice(0, 2).map(account => buildLink(account)).filter(Boolean);

  if (accounts.length > 2) {
    renderedAccounts.push(
      <FormattedMessage
        key='more'
        id='notification.more'
        defaultMessage='{count, plural, one {# other} other {# others}}'
        values={{ count: accounts.length - renderedAccounts.length }}
      />,
    );
  }

  return intl.formatMessage(messages[type], {
    name: <FormattedList type='conjunction' value={renderedAccounts} />,
    targetName,
    instance: instanceTitle,
    count: accounts.length,
  });
};

const avatarSize = 48;

interface INotification {
  hidden?: boolean;
  notification: NotificationGroup;
  onMoveUp?: (notificationId: string) => void;
  onMoveDown?: (notificationId: string) => void;
  onReblog?: (status: StatusEntity, e?: KeyboardEvent) => void;
}

const getNotificationStatus = (n: Pick<NotificationGroup, 'type'> & ({ status: StatusEntity } | { })): StatusEntity | null => {
  if (['mention', 'status', 'reblog', 'favourite', 'poll', 'update', 'emoji_reaction', 'event_reminder', 'participation_accepted', 'participation_request'].includes(n.type))
    // @ts-ignore
    return n.status;
  return null;
};

const Notification: React.FC<INotification> = (props) => {
  const { hidden = false, onMoveUp, onMoveDown } = props;

  const dispatch = useAppDispatch();

  const getNotification = useCallback(makeGetNotification(), []);

  const { me } = useLoggedIn();
  const { toggleStatusMediaHidden } = useStatusMetaStore();
  const { openModal } = useModalsStore();
  const { settings } = useSettingsStore();

  const notification = useAppSelector((state) => getNotification(state, props.notification));
  const status = getNotificationStatus(notification);

  const history = useHistory();
  const intl = useIntl();
  const { data: instance } = useInstance();

  const type = notification.type;
  const { accounts } = notification;
  const account = accounts[0];

  const getHandlers = () => ({
    reply: handleMention,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleMention,
    open: handleOpen,
    openProfile: handleOpenProfile,
    moveUp: handleMoveUp,
    moveDown: handleMoveDown,
    toggleSensitive: handleHotkeyToggleSensitive,
  });

  const handleOpen = () => {
    if (status && typeof status === 'object' && account && typeof account === 'object') {
      history.push(`/@${account.acct}/posts/${status.id}`);
    } else {
      handleOpenProfile();
    }
  };

  const handleOpenProfile = () => {
    if (account && typeof account === 'object') {
      history.push(`/@${account.acct}`);
    }
  };

  const handleMention = useCallback((e?: KeyboardEvent) => {
    e?.preventDefault();

    if (account && typeof account === 'object') {
      dispatch(mentionCompose(account));
    }
  }, [account]);

  const handleHotkeyFavourite = useCallback((e?: KeyboardEvent) => {
    if (status && typeof status === 'object') {
      if (status.favourited) {
        dispatch(unfavourite(status));
      } else {
        dispatch(favourite(status));
      }
    }
  }, [status]);

  const handleHotkeyBoost = useCallback((e?: KeyboardEvent) => {
    if (status && typeof status === 'object') {
      const boostModal = settings.boostModal;
      if (status.reblogged) {
        dispatch(unreblog(status));
      } else {
        if (e?.shiftKey || !boostModal) {
          dispatch(reblog(status));
        } else {
          openModal('BOOST', {
            statusId: status.id,
            onReblog: (status) => {
              dispatch(reblog(status));
            },
          });
        }
      }
    }
  }, [status]);

  const handleHotkeyToggleSensitive = useCallback(() => {
    if (status && typeof status === 'object') {
      toggleStatusMediaHidden(status.id);
    }
  }, [status]);

  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp(notification.group_key);
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown(notification.group_key);
    }
  };

  const displayedType = notification.type === 'mention' && (notification.subtype === 'reply' || status?.in_reply_to_account_id === me) ? 'reply' : notification.type;

  const renderIcon = (): React.ReactNode => {
    if (type === 'emoji_reaction' && notification.emoji) {
      return (
        <Emoji
          emoji={notification.emoji}
          src={notification.emoji_url || undefined}
          className='size-4 flex-none'
        />
      );
    } else if (icons[displayedType]) {
      return (
        <Icon
          src={icons[displayedType]!}
          className='flex-none text-primary-600 dark:text-primary-400'
        />
      );
    } else {
      return null;
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'follow':
      case 'follow_request':
        return account && typeof account === 'object' ? (
          <AccountContainer
            id={account.id}
            hidden={hidden}
            avatarSize={avatarSize}
            actionType='follow_request'
            withRelationship
          />
        ) : null;
      case 'bite':
        return account && typeof account === 'object' ? (
          <AccountContainer
            id={account.id}
            hidden={hidden}
            avatarSize={avatarSize}
            actionType='biting'
            withRelationship
          />
        ) : null;
      case 'move':
        return account && typeof account === 'object' && notification.target && typeof notification.target === 'object' ? (
          <AccountContainer
            id={notification.target_id}
            hidden={hidden}
            avatarSize={avatarSize}
            withRelationship
          />
        ) : null;
      case 'favourite':
      case 'mention':
      case 'reblog':
      case 'status':
      case 'poll':
      case 'update':
      case 'emoji_reaction':
      case 'event_reminder':
      case 'participation_accepted':
      case 'participation_request':
        return status && typeof status === 'object' ? (
          <StatusContainer
            id={status.id}
            hidden={hidden}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            avatarSize={avatarSize}
            contextType='notifications'
            showGroup={false}
          />
        ) : null;
      default:
        return null;
    }
  };

  const targetName = notification.type === 'move' ? notification.target.acct : '';

  const message: React.ReactNode = account && typeof account === 'object'
    ? buildMessage(intl, displayedType, accounts, targetName, instance.title)
    : null;

  const ariaLabel = (
    notificationForScreenReader(
      intl,
      intl.formatMessage(messages[displayedType], {
        name: account && typeof account === 'object' ? account.acct : '',
        targetName,
      }),
      notification.latest_page_notification_at!,
    )
  );

  return (
    <HotKeys handlers={getHandlers()} data-testid='notification'>
      <div
        className='notification focusable'
        tabIndex={0}
        aria-label={ariaLabel}
      >
        <div className='focusable p-4'>
          <div className='mb-2'>
            <HStack alignItems='center' space={3}>
              <div
                className='flex justify-end'
                style={{ flexBasis: avatarSize }}
              >
                {renderIcon()}
              </div>

              <div className='truncate'>
                <Text
                  theme='muted'
                  size='xs'
                  truncate
                  data-testid='message'
                >
                  {message}
                </Text>
              </div>

              {!['mention', 'status'].includes(notification.type) && (
                <div className='ml-auto'>
                  <Text
                    theme='muted'
                    size='xs'
                    truncate
                    data-testid='message'
                  >
                    <RelativeTimestamp timestamp={notification.latest_page_notification_at!} theme='muted' size='sm' className='whitespace-nowrap' />
                  </Text>
                </div>
              )}
            </HStack>
          </div>

          <div>
            {renderContent()}
          </div>
        </div>
      </div>
    </HotKeys>
  );
};

export { Notification as default, buildLink, getNotificationStatus };
