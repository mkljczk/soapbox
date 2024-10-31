import { List as ImmutableList, OrderedSet as ImmutableOrderedSet } from 'immutable';
import { useStatus } from 'pl-hooks';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { eventDiscussionCompose } from 'pl-fe/actions/compose';
import { fetchStatusWithContext } from 'pl-fe/actions/statuses';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Tombstone from 'pl-fe/components/tombstone';
import Stack from 'pl-fe/components/ui/stack';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import PendingStatus from 'pl-fe/features/ui/components/pending-status';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import ComposeForm from '../compose/components/compose-form';
import { makeGetDescendantsIds } from '../status/components/thread';
import ThreadStatus from '../status/components/thread-status';

import type { MediaAttachment } from 'pl-api';

type RouteParams = { statusId: string };

interface IEventDiscussion {
  params: RouteParams;
  onOpenMedia: (media: Array<MediaAttachment>, index: number) => void;
  onOpenVideo: (video: MediaAttachment, time: number) => void;
}

const EventDiscussion: React.FC<IEventDiscussion> = ({ params: { statusId: statusId } }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { data: status } = useStatus(statusId);
  const getDescendantsIds = useCallback(makeGetDescendantsIds(), []);

  const me = useAppSelector((state) => state.me);

  const descendantsIds = useAppSelector(state => getDescendantsIds(state, statusId).delete(statusId));

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);

  const node = useRef<HTMLDivElement>(null);

  const fetchData = () => {
    return dispatch(fetchStatusWithContext(statusId, intl));
  };

  useEffect(() => {
    fetchData().then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [statusId]);

  useEffect(() => {
    if (isLoaded && me) dispatch(eventDiscussionCompose(`reply:${statusId}`, status!));
  }, [isLoaded, me]);

  const handleMoveUp = (id: string) => {
    const index = ImmutableList(descendantsIds).indexOf(id);
    _selectChild(index - 1);
  };

  const handleMoveDown = (id: string) => {
    const index = ImmutableList(descendantsIds).indexOf(id);
    _selectChild(index + 1);
  };

  const _selectChild = (index: number) => {
    const selector = `#thread [data-index="${index}"] .focusable`;
    const element = document.querySelector<HTMLDivElement>(selector);

    if (element) element.focus();
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
      focusedStatusId={statusId}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
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

  const renderChildren = (list: ImmutableOrderedSet<string>) => list.map(id => {
    if (id.endsWith('-tombstone')) {
      return renderTombstone(id);
    } else if (id.startsWith('末pending-')) {
      return renderPendingStatus(id);
    } else {
      return renderStatus(id);
    }
  });

  const hasDescendants = descendantsIds.size > 0;

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
  } else if (!status) {
    return (
      <PlaceholderStatus />
    );
  }

  const children: JSX.Element[] = [];

  if (hasDescendants) {
    children.push(...renderChildren(descendantsIds).toArray());
  }

  return (
    <Stack space={2}>
      {me && <div className='border-b border-solid border-gray-200 p-2 pt-0 dark:border-gray-800'>
        <ComposeForm id={`reply:${status.id}`} autoFocus={false} event={status.id} transparent />
      </div>}
      <div ref={node} className='thread p-0 shadow-none sm:p-2'>
        <ScrollableList
          id='thread'
          placeholderComponent={() => <PlaceholderStatus variant='slim' />}
          emptyMessage={<FormattedMessage id='event.discussion.empty' defaultMessage='No one has commented this event yet. When someone does, they will appear here.' />}
        >
          {children}
        </ScrollableList>
      </div>
    </Stack>
  );
};

export { EventDiscussion as default };
