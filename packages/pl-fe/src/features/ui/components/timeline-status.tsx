import clsx from 'clsx';
import React from 'react';

import Tombstone from 'pl-fe/components/tombstone';
import StatusContainer from 'pl-fe/containers/status-container';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

interface IThreadStatus {
  id: string;
  contextType?: string;
  isConnectedTop?: boolean;
  isConnectedBottom?: boolean;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  rebloggedBy?: Array<string>;
}

/** Status with reply-connector in threads. */
const TimelineStatus: React.FC<IThreadStatus> = (props): JSX.Element => {
  const { id, isConnectedTop, isConnectedBottom } = props;

  const isLoaded = useAppSelector(state => Boolean(state.statuses[id]));
  const isDeleted = useAppSelector(state => Boolean(state.statuses[id]?.deleted));

  if (isDeleted) {
    return (
      <div className='py-4 pb-8'>
        <Tombstone id={id} onMoveUp={props.onMoveUp} onMoveDown={props.onMoveDown} deleted />
      </div>
    );
  }

  const renderConnector = (): JSX.Element | null => {
    const isConnected = isConnectedTop || isConnectedBottom;

    if (!isConnected) return null;

    return (
      <div
        className={clsx('absolute left-10 z-[1] hidden w-0.5 bg-gray-200 black:bg-gray-800 dark:bg-primary-800 rtl:left-auto rtl:right-5', {
          '!block top-20 h-[calc(100%-42px-8px-1rem)]': isConnectedBottom,
        })}
      />
    );
  };

  return (
    <div className={clsx('relative', {
      'timeline-status-connected': isConnectedBottom,
      'border-b border-solid border-gray-200 dark:border-gray-800': !isConnectedBottom,
    })}
    >
      {renderConnector()}
      {isLoaded ? (
        // @ts-ignore FIXME
        <StatusContainer {...props} showGroup={false} />
      ) : (
        <PlaceholderStatus variant='default' />
      )}
    </div>
  );
};

export { TimelineStatus as default };
