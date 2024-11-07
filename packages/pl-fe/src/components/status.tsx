import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef } from 'react';
import { defineMessages, useIntl, FormattedList, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { mentionCompose, replyCompose } from 'pl-fe/actions/compose';
import { toggleFavourite, toggleReblog } from 'pl-fe/actions/interactions';
import { toggleStatusMediaHidden, unfilterStatus } from 'pl-fe/actions/statuses';
import Card from 'pl-fe/components/ui/card';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import AccountContainer from 'pl-fe/containers/account-container';
import Emojify from 'pl-fe/features/emoji/emojify';
import StatusTypeIcon from 'pl-fe/features/status/components/status-type-icon';
import { HotKeys } from 'pl-fe/features/ui/components/hotkeys';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { makeGetStatus, type SelectedStatus } from 'pl-fe/selectors';
import { useModalsStore } from 'pl-fe/stores/modals';
import { textForScreenReader } from 'pl-fe/utils/status';

import EventPreview from './event-preview';
import StatusActionBar from './status-action-bar';
import StatusContent from './status-content';
import StatusLanguagePicker from './status-language-picker';
import StatusReactionsBar from './status-reactions-bar';
import StatusReplyMentions from './status-reply-mentions';
import StatusInfo from './statuses/status-info';

const messages = defineMessages({
  reblogged_by: { id: 'status.reblogged_by', defaultMessage: '{name} reposted' },
});

interface IStatus {
  id?: string;
  avatarSize?: number;
  status: SelectedStatus;
  onClick?: () => void;
  muted?: boolean;
  hidden?: boolean;
  unread?: boolean;
  onMoveUp?: (statusId: string, featured?: boolean) => void;
  onMoveDown?: (statusId: string, featured?: boolean) => void;
  focusable?: boolean;
  featured?: boolean;
  hideActionBar?: boolean;
  hoverable?: boolean;
  variant?: 'default' | 'rounded' | 'slim';
  showGroup?: boolean;
  accountAction?: React.ReactElement;
  fromBookmarks?: boolean;
}

const Status: React.FC<IStatus> = (props) => {
  const {
    status,
    accountAction,
    avatarSize = 42,
    focusable = true,
    hoverable = true,
    onClick,
    onMoveUp,
    onMoveDown,
    muted,
    hidden,
    featured,
    unread,
    hideActionBar,
    variant = 'rounded',
    showGroup = true,
    fromBookmarks = false,
  } = props;

  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const { openModal } = useModalsStore();
  const { boostModal } = useSettings();
  const didShowCard = useRef(false);
  const node = useRef<HTMLDivElement>(null);

  const getStatus = useCallback(makeGetStatus(), []);
  const actualStatus = useAppSelector(state => status.reblog_id && getStatus(state, { id: status.reblog_id }) || status)!;

  const isReblog = status.reblog_id;
  const statusUrl = `/@${actualStatus.account.acct}/posts/${actualStatus.id}`;
  const group = actualStatus.group;

  const filtered = (status.filtered?.length || actualStatus.filtered?.length) > 0;

  // Track height changes we know about to compensate scrolling.
  useEffect(() => {
    didShowCard.current = Boolean(!muted && !hidden && status?.card);
  }, []);

  const handleClick = (e?: React.MouseEvent): void => {
    e?.stopPropagation();

    // If the user is selecting text, don't focus the status.
    if (getSelection()?.toString().length) {
      return;
    }

    if (!e || !(e.ctrlKey || e.metaKey)) {
      if (onClick) {
        onClick();
      } else {
        history.push(statusUrl);
      }
    } else {
      window.open(statusUrl, '_blank');
    }
  };

  const handleHotkeyOpenMedia = (e?: KeyboardEvent): void => {
    const status = actualStatus;
    const firstAttachment = status.media_attachments[0];

    e?.preventDefault();

    if (firstAttachment) {
      if (firstAttachment.type === 'video') {
        openModal('VIDEO', { statusId: status.id, media: firstAttachment, time: 0 });
      } else {
        openModal('MEDIA', { statusId: status.id, media: status.media_attachments, index: 0 });
      }
    }
  };

  const handleHotkeyReply = (e?: KeyboardEvent): void => {
    e?.preventDefault();
    dispatch(replyCompose(actualStatus, status.reblog_id ? status.account : undefined));
  };

  const handleHotkeyFavourite = (e?: KeyboardEvent): void => {
    e?.preventDefault();
    dispatch(toggleFavourite(actualStatus));
  };

  const handleHotkeyBoost = (e?: KeyboardEvent): void => {
    const modalReblog = () => dispatch(toggleReblog(actualStatus));
    if ((e && e.shiftKey) || !boostModal) {
      modalReblog();
    } else {
      openModal('BOOST', { statusId: actualStatus.id, onReblog: modalReblog });
    }
  };

  const handleHotkeyMention = (e?: KeyboardEvent): void => {
    e?.preventDefault();
    dispatch(mentionCompose(actualStatus.account));
  };

  const handleHotkeyOpen = (): void => {
    history.push(statusUrl);
  };

  const handleHotkeyOpenProfile = (): void => {
    history.push(`/@${actualStatus.account.acct}`);
  };

  const handleHotkeyMoveUp = (e?: KeyboardEvent): void => {
    if (onMoveUp) {
      onMoveUp(status.id, featured);
    }
  };

  const handleHotkeyMoveDown = (e?: KeyboardEvent): void => {
    if (onMoveDown) {
      onMoveDown(status.id, featured);
    }
  };

  const handleHotkeyToggleSensitive = (): void => {
    dispatch(toggleStatusMediaHidden(actualStatus));
  };

  const handleHotkeyReact = (): void => {
    (node.current?.querySelector('.emoji-picker-dropdown') as HTMLButtonElement)?.click();
  };

  const handleUnfilter = () => dispatch(unfilterStatus(status.filtered.length ? status.id : actualStatus.id));

  const renderStatusInfo = () => {
    if (isReblog && showGroup && group) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={require('@tabler/icons/outline/repeat.svg')} className='size-4 text-green-600' />}
          text={
            <FormattedMessage
              id='status.reblogged_by_with_group'
              defaultMessage='{name} reposted from {group}'
              values={{
                name: (
                  <Link
                    to={`/@${status.account.acct}`}
                    className='hover:underline'
                  >
                    <bdi className='truncate'>
                      <strong className='text-gray-800 dark:text-gray-200'>
                        <Emojify text={status.account.display_name} emojis={status.account.emojis} />
                      </strong>
                    </bdi>
                  </Link>
                ),
                group: (
                  <Link to={`/groups/${group.id}`} className='hover:underline'>
                    <strong className='text-gray-800 dark:text-gray-200'>
                      <Emojify text={group.display_name} emojis={group.emojis} />
                    </strong>
                  </Link>
                ),
              }}
            />
          }
        />
      );
    } else if (isReblog) {
      const accounts = status.accounts || [status.account];

      const renderedAccounts = accounts.slice(0, 2).map(account => !!account && (
        <Link key={account.acct} to={`/@${account.acct}`} className='hover:underline'>
          <bdi className='truncate'>
            <strong className='text-gray-800 dark:text-gray-200'>
              <Emojify text={account.display_name} emojis={account.emojis} />
            </strong>
          </bdi>
        </Link>
      ));

      if (accounts.length > 2) {
        renderedAccounts.push(
          <FormattedMessage
            id='notification.more'
            defaultMessage='{count, plural, one {# other} other {# others}}'
            values={{ count: accounts.length - renderedAccounts.length }}
          />,
        );
      }

      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={require('@tabler/icons/outline/repeat.svg')} className='size-4 text-green-600' />}
          text={
            <FormattedMessage
              id='status.reblogged_by'
              defaultMessage='{name} reposted'
              values={{
                name: <FormattedList type='conjunction' value={renderedAccounts} />,
                count: accounts.length,
              }}
            />
          }
        />
      );
    } else if (featured) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={require('@tabler/icons/outline/pinned.svg')} className='size-4 text-gray-600 dark:text-gray-400' />}
          text={
            <FormattedMessage id='status.pinned' defaultMessage='Pinned post' />
          }
        />
      );
    } else if (showGroup && group) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={require('@tabler/icons/outline/circles.svg')} className='size-4 text-primary-600 dark:text-accent-blue' />}
          text={
            <FormattedMessage
              id='status.group'
              defaultMessage='Posted in {group}'
              values={{
                group: (
                  <Link to={`/groups/${group.id}`} className='hover:underline'>
                    <bdi className='truncate'>
                      <strong className='text-gray-800 dark:text-gray-200'>
                        <Emojify text={group.display_name} emojis={group.emojis} />
                      </strong>
                    </bdi>
                  </Link>
                ),
              }}
            />
          }
        />
      );
    }
  };

  if (!status) return null;

  if (hidden) {
    return (
      <div ref={node}>
        <>
          {actualStatus.account.display_name || actualStatus.account.username}
          {actualStatus.content}
        </>
      </div>
    );
  }

  if (filtered && status.showFiltered !== false) {
    const minHandlers = muted ? undefined : {
      moveUp: handleHotkeyMoveUp,
      moveDown: handleHotkeyMoveDown,
    };

    return (
      <HotKeys handlers={minHandlers}>
        <div className={clsx('status__wrapper text-center', { focusable })} tabIndex={focusable ? 0 : undefined} ref={node}>
          <Text theme='muted'>
            <FormattedMessage id='status.filtered' defaultMessage='Filtered' />: {status.filtered.join(', ')}.
            {' '}
            <button className='text-primary-600 hover:underline dark:text-accent-blue' onClick={handleUnfilter}>
              <FormattedMessage id='status.show_filter_reason' defaultMessage='Show anyway' />
            </button>
          </Text>
        </div>
      </HotKeys>
    );
  }

  let rebloggedByText;
  if (status.reblog_id === 'object') {
    rebloggedByText = intl.formatMessage(
      messages.reblogged_by,
      { name: status.account.acct },
    );
  }

  const handlers = muted ? undefined : {
    reply: handleHotkeyReply,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleHotkeyMention,
    open: handleHotkeyOpen,
    openProfile: handleHotkeyOpenProfile,
    moveUp: handleHotkeyMoveUp,
    moveDown: handleHotkeyMoveDown,
    toggleSensitive: handleHotkeyToggleSensitive,
    openMedia: handleHotkeyOpenMedia,
    react: handleHotkeyReact,
  };

  return (
    <HotKeys handlers={handlers} data-testid='status'>
      <div
        className={clsx('status cursor-pointer', { focusable })}
        tabIndex={focusable && !muted ? 0 : undefined}
        data-featured={featured ? 'true' : null}
        aria-label={textForScreenReader(intl, actualStatus, rebloggedByText)}
        ref={node}
        onClick={handleClick}
        role='link'
      >
        <Card
          variant={variant}
          className={clsx('status__wrapper space-y-4', `status-${actualStatus.visibility}`, {
            'py-6 sm:p-5': variant === 'rounded',
            'status-reply': !!status.in_reply_to_id,
            muted,
            read: unread === false,
          })}
          data-id={status.id}
        >
          {renderStatusInfo()}

          <AccountContainer
            key={actualStatus.account_id}
            id={actualStatus.account_id}
            timestamp={actualStatus.created_at}
            timestampUrl={statusUrl}
            action={accountAction}
            hideActions={!accountAction}
            showEdit={!!actualStatus.edited_at}
            showAccountHoverCard={hoverable}
            withLinkToProfile={hoverable}
            approvalStatus={actualStatus.approval_status}
            avatarSize={avatarSize}
            items={(
              <>
                <StatusTypeIcon status={actualStatus} />
                <StatusLanguagePicker status={actualStatus} />
              </>
            )}
          />

          <div className='status__content-wrapper'>
            <StatusReplyMentions status={actualStatus} hoverable={hoverable} />

            <Stack className='relative z-0'>
              {actualStatus.event ? <EventPreview className='shadow-xl' status={actualStatus} /> : (
                <StatusContent
                  status={actualStatus}
                  onClick={handleClick}
                  collapsable
                  translatable
                  withMedia
                />
              )}
            </Stack>

            <StatusReactionsBar status={actualStatus} collapsed />

            {!hideActionBar && (
              <div
                className={clsx({
                  'pt-2': actualStatus.emoji_reactions.length,
                  'pt-4': !actualStatus.emoji_reactions.length,
                })}
              >
                <StatusActionBar
                  status={actualStatus}
                  rebloggedBy={isReblog ? status.account : undefined}
                  fromBookmarks={fromBookmarks}
                  expandable
                />
              </div>
            )}
          </div>
        </Card>
      </div >
    </HotKeys >
  );
};

export {
  type IStatus,
  Status as default,
};
