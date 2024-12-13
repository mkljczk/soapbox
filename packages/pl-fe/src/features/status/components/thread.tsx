import { createSelector } from '@reduxjs/toolkit';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { type ComposeReplyAction, mentionCompose, replyCompose } from 'pl-fe/actions/compose';
import ScrollableList from 'pl-fe/components/scrollable-list';
import StatusActionBar from 'pl-fe/components/status-action-bar';
import Tombstone from 'pl-fe/components/tombstone';
import Stack from 'pl-fe/components/ui/stack';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import { HotKeys } from 'pl-fe/features/ui/components/hotkeys';
import PendingStatus from 'pl-fe/features/ui/components/pending-status';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { favouriteStatusMutationOptions, reblogStatusMutationOptions, unfavouriteStatusMutationOptions, unreblogStatusMutationOptions } from 'pl-fe/queries/statuses/status-interactions';
import { RootState } from 'pl-fe/store';
import { useModalsStore } from 'pl-fe/stores/modals';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { useStatusMetaStore } from 'pl-fe/stores/status-meta';
import { textForScreenReader } from 'pl-fe/utils/status';

import DetailedStatus from './detailed-status';
import ThreadStatus from './thread-status';

import type { Virtualizer } from '@tanstack/react-virtual';
import type { Account } from 'pl-fe/normalizers/account';
import type { Status } from 'pl-fe/normalizers/status';

const makeGetAncestorsIds = () => createSelector([
  (_: RootState, statusId: string | undefined) => statusId,
  (state: RootState) => state.contexts.inReplyTos,
], (statusId, inReplyTos) => {
  let ancestorsIds: Array<string> = [];
  let id: string | undefined = statusId;

  while (id && !ancestorsIds.includes(id)) {
    ancestorsIds = [id, ...ancestorsIds];
    id = inReplyTos[id];
  }

  return [...new Set(ancestorsIds)];
});

const makeGetDescendantsIds = () => createSelector([
  (_: RootState, statusId: string) => statusId,
  (state: RootState) => state.contexts.replies,
], (statusId, contextReplies) => {
  let descendantsIds: Array<string> = [];
  const ids = [statusId];

  while (ids.length > 0) {
    const id = ids.shift();
    if (!id) break;

    const replies = contextReplies[id];

    if (descendantsIds.includes(id)) {
      break;
    }

    if (statusId !== id) {
      descendantsIds = [...descendantsIds, id];
    }

    if (replies) {
      replies.toReversed().forEach((reply: string) => {
        ids.unshift(reply);
      });
    }
  }

  return [...new Set(descendantsIds)];
});

const makeGetThread = () => {
  const getAncestorsIds = makeGetAncestorsIds();
  const getDescendantsIds = makeGetDescendantsIds();

  return createSelector([
    (state: RootState, statusId: string) => getAncestorsIds(state, statusId),
    (state: RootState, statusId: string) => getDescendantsIds(state, statusId),
    (_, statusId: string) => statusId,
  ],
  (ancestorsIds, descendantsIds, statusId) => {
    ancestorsIds = ancestorsIds.filter(id => id !== statusId && !descendantsIds.includes(id));
    descendantsIds = descendantsIds.filter(id => id !== statusId && !ancestorsIds.includes(id));

    return {
      ancestorsIds,
      descendantsIds,
    };
  });
};

interface IThread {
  status: Status;
  withMedia?: boolean;
  isModal?: boolean;
  itemClassName?: string;
}

const Thread: React.FC<IThread> = ({
  itemClassName,
  status,
  isModal,
  withMedia = true,
}) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();

  const { toggleStatusMediaHidden } = useStatusMetaStore();
  const { openModal } = useModalsStore();
  const { settings } = useSettingsStore();

  const getThread = useCallback(makeGetThread(), []);

  const { mutate: reblogStatus } = useMutation(reblogStatusMutationOptions);
  const { mutate: unreblogStatus } = useMutation(unreblogStatusMutationOptions);
  const { mutate: favouriteStatus } = useMutation(favouriteStatusMutationOptions);
  const { mutate: unfavouriteStatus } = useMutation(unfavouriteStatusMutationOptions);

  const { ancestorsIds, descendantsIds } = useAppSelector((state) => getThread(state, status.id));

  let initialIndex = ancestorsIds.length;
  if (isModal && initialIndex !== 0) initialIndex = ancestorsIds.length + 1;

  const node = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const virtualizer = useRef<Virtualizer<any, any>>(null);

  const handleHotkeyReact = () => {
    if (statusRef.current) {
      (node.current?.querySelector('.emoji-picker-dropdown') as HTMLButtonElement)?.click();
    }
  };

  const handleFavouriteClick = (status: Status) => {
    if (status.favourited) unfavouriteStatus(status.id);
    else favouriteStatus(status.id);
  };

  const handleReplyClick = (status: ComposeReplyAction['status']) => dispatch(replyCompose(status));

  const handleModalReblog = (status: Pick<Status, 'id'>) => reblogStatus({ statusId: status.id });

  const handleReblogClick = (status: Status, e?: React.MouseEvent) => {
    const boostModal = settings.boostModal;
    if (status.reblogged) {
      unreblogStatus(status.id);
    } else {
      if ((e && e.shiftKey) || !boostModal) {
        handleModalReblog(status);
      } else {
        openModal('BOOST', { statusId: status.id, onReblog: handleModalReblog });
      }
    }
  };

  const handleMentionClick = (account: Pick<Account, 'acct'>) => dispatch(mentionCompose(account));

  const handleHotkeyOpenMedia = (e?: KeyboardEvent) => {
    const media = status.media_attachments;

    e?.preventDefault();

    if (media && media.length) {
      const firstAttachment = media[0];

      if (media.length === 1 && firstAttachment.type === 'video') {
        openModal('VIDEO', { media: firstAttachment, statusId: status.id });
      } else {
        openModal('MEDIA', { media, index: 0, statusId: status.id });
      }
    }
  };

  const handleHotkeyMoveUp = () => {
    handleMoveUp(status.id);
  };

  const handleHotkeyMoveDown = () => {
    handleMoveDown(status.id);
  };

  const handleHotkeyReply = (e?: KeyboardEvent) => {
    e?.preventDefault();
    handleReplyClick(status);
  };

  const handleHotkeyFavourite = () => {
    handleFavouriteClick(status);
  };

  const handleHotkeyBoost = () => {
    handleReblogClick(status);
  };

  const handleHotkeyMention = (e?: KeyboardEvent) => {
    e?.preventDefault();
    const { account } = status;
    if (!account || typeof account !== 'object') return;
    handleMentionClick(account);
  };

  const handleHotkeyOpenProfile = () => {
    history.push(`/@${status.account.acct}`);
  };

  const handleHotkeyToggleSensitive = () => {
    toggleStatusMediaHidden(status.id);
  };

  const handleMoveUp = (id: string) => {
    if (id === status.id) {
      _selectChild(ancestorsIds.length - 1);
    } else {
      let index = ancestorsIds.indexOf(id);

      if (index === -1) {
        index = descendantsIds.indexOf(id);
        _selectChild(ancestorsIds.length + index);
      } else {
        _selectChild(index - 1);
      }
    }
  };

  const handleMoveDown = (id: string) => {
    if (id === status.id) {
      _selectChild(ancestorsIds.length + 1);
    } else {
      let index = ancestorsIds.indexOf(id);

      if (index === -1) {
        index = descendantsIds.indexOf(id);
        _selectChild(ancestorsIds.length + index + 2);
      } else {
        _selectChild(index + 1);
      }
    }
  };

  const _selectChild = (index: number) => {
    if (isModal) index = index + 1;

    const selector = `[data-index="${index}"] .focusable`;
    const element = node.current?.querySelector<HTMLDivElement>(selector);

    if (element) element.focus();

    if (!element) {
      virtualizer.current?.scrollToIndex(index, { behavior: 'smooth' });
      setTimeout(() => node.current?.querySelector<HTMLDivElement>(selector)?.focus(), 0);
    }
  };

  const renderTombstone = (id: string) => (
    <div className='py-4 pb-8'>
      <Tombstone
        key={id}
        id={id}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />
    </div>
  );

  const renderStatus = (id: string) => (
    <ThreadStatus
      key={id}
      id={id}
      focusedStatusId={status.id}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      contextType='thread'
    />
  );

  const renderPendingStatus = (id: string) => {
    const idempotencyKey = id.replace(/^末pending-/, '');

    return (
      <PendingStatus
        key={id}
        idempotencyKey={idempotencyKey}
        variant='default'
      />
    );
  };

  const renderChildren = (list: Array<string>) => list.map(id => {
    if (id.endsWith('-tombstone')) {
      return renderTombstone(id);
    } else if (id.startsWith('末pending-')) {
      return renderPendingStatus(id);
    } else {
      return renderStatus(id);
    }
  });

  // Scroll focused status into view when thread updates.
  useEffect(() => {
    virtualizer.current?.scrollToIndex(ancestorsIds.length);
  }, [status.id, ancestorsIds.length]);

  const handleOpenCompareHistoryModal = (status: Pick<Status, 'id'>) => {
    openModal('COMPARE_HISTORY', {
      statusId: status.id,
    });
  };

  const hasAncestors = ancestorsIds.length > 0;
  const hasDescendants = descendantsIds.length > 0;

  type HotkeyHandlers = { [key: string]: (keyEvent?: KeyboardEvent) => void };

  const handlers: HotkeyHandlers = {
    moveUp: handleHotkeyMoveUp,
    moveDown: handleHotkeyMoveDown,
    reply: handleHotkeyReply,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleHotkeyMention,
    openProfile: handleHotkeyOpenProfile,
    toggleSensitive: handleHotkeyToggleSensitive,
    openMedia: handleHotkeyOpenMedia,
    react: handleHotkeyReact,
  };

  const focusedStatus = (
    <div className={clsx({ 'pb-4': hasDescendants })} key={status.id}>
      {status.deleted ? (
        <Tombstone id={status.id} onMoveUp={handleMoveUp} onMoveDown={handleMoveDown} deleted />
      ) : (
        <HotKeys handlers={handlers}>
          <div
            ref={statusRef}
            className='focusable relative'
            tabIndex={0}
            // FIXME: no "reblogged by" text is added for the screen reader
            aria-label={textForScreenReader(intl, status)}
          >

            <DetailedStatus
              status={status}
              withMedia={withMedia}
              onOpenCompareHistoryModal={handleOpenCompareHistoryModal}
            />

            <hr className='-mx-4 mb-2 max-w-[100vw] border-t-2 black:border-t dark:border-gray-800' />

            <StatusActionBar
              status={status}
              expandable={isModal}
              space='lg'
              withLabels
            />
          </div>
        </HotKeys>
      )}

      {hasDescendants && (
        <hr className='-mx-4 mt-2 max-w-[100vw] border-t-2 black:border-t dark:border-gray-800' />
      )}
    </div>
  );

  const children: JSX.Element[] = [];

  if (isModal) {
    // Add padding to the top of the Thread (for Media Modal)
    children.push(<div key='padding' className='h-4' />);
  }

  if (hasAncestors) {
    children.push(...renderChildren(ancestorsIds));
  }

  children.push(focusedStatus);

  if (hasDescendants) {
    children.push(...renderChildren(descendantsIds));
  }

  return (
    <Stack
      space={2}
      className={
        clsx({
          'h-full': isModal,
          'mt-2': !isModal,
        })
      }
    >
      {status.account.local === false && (
        <Helmet>
          <meta content='noindex, noarchive' name='robots' />
        </Helmet>
      )}

      <div
        ref={node}
        className={
          clsx('bg-white black:bg-black dark:bg-primary-900', {
            'h-full overflow-auto': isModal,
          })
        }
      >
        <ScrollableList
          id='thread'
          ref={virtualizer}
          placeholderComponent={() => <PlaceholderStatus variant='slim' />}
          initialIndex={initialIndex}
          itemClassName={itemClassName}
          listClassName={
            clsx({
              'h-full': isModal,
            })
          }
          {...(isModal ? { parentRef: node } : undefined)}
        >
          {children}
        </ScrollableList>
      </div>
    </Stack>
  );
};

export { makeGetDescendantsIds, Thread as default };
