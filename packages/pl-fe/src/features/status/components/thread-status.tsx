import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React from 'react';

import Tombstone from 'pl-fe/components/tombstone';
import StatusContainer from 'pl-fe/containers/status-container';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { statusQueryOptions } from 'pl-fe/queries/statuses/status';

interface IThreadStatus {
  id: string;
  contextType?: string;
  focusedStatusId: string;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

/** Status with reply-connector in threads. */
const ThreadStatus: React.FC<IThreadStatus> = (props): JSX.Element => {
  const { id, focusedStatusId } = props;

  const replyToId = useAppSelector(state => state.contexts.inReplyTos[id]);
  const replyCount = useAppSelector(state => (state.contexts.replies[id] || []).length);
  const { isFetched } = useQuery(statusQueryOptions(id));
  const isDeleted = useAppSelector(state => Boolean(state.statuses[id]?.deleted));

  if (isDeleted) {
    return (
      <div className='py-4 pb-8'>
        <Tombstone id={id} onMoveUp={props.onMoveUp} onMoveDown={props.onMoveDown} deleted />
      </div>
    );
  }

  const renderConnector = (): JSX.Element | null => {
    const isConnectedTop = replyToId && replyToId !== focusedStatusId;
    const isConnectedBottom = replyCount > 0;
    const isConnected = isConnectedTop || isConnectedBottom;

    if (!isConnected) return null;

    return (
      <div
        className={clsx('absolute left-5 z-[1] hidden w-0.5 bg-gray-200 black:bg-gray-800 dark:bg-primary-800 rtl:left-auto rtl:right-5', {
          '!block top-[calc(12px+42px)] h-[calc(100%-42px-8px-1rem)]': isConnectedBottom,
        })}
      />
    );
  };

  return (
    <div className='thread__status relative pb-4'>
      {renderConnector()}
      {isFetched ? (
        // @ts-ignore FIXME
        <StatusContainer {...props} showGroup={false} />
      ) : (
        <PlaceholderStatus variant='default' />
      )}
    </div>
  );
};

export { ThreadStatus as default };
