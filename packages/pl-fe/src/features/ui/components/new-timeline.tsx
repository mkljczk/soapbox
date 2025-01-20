import React from 'react';

import LoadMore from 'pl-fe/components/load-more';
import ScrollableList from 'pl-fe/components/scrollable-list';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import { type TimelineEntry, useHomeTimeline } from 'pl-fe/queries/timelines/use-home-timeline';

import TimelineStatus from './timeline-status';

const NewTimeline = () => {
  const {
    data,
    handleLoadMore,
    isLoading,
  } = useHomeTimeline();

  const getCurrentStatusIndex = (id: string) =>
    (data || []).findIndex(entry => entry.type === 'status' && entry.id === id);

  const handleMoveUp = (id: string) => {
    const elementIndex = getCurrentStatusIndex(id) - 1;
    if (!selectChild(elementIndex)) selectChild(elementIndex - 1);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex = getCurrentStatusIndex(id) + 1;
    if (!selectChild(elementIndex)) selectChild(elementIndex + 1);
  };

  const selectChild = (index?: number) => {
    if (index === undefined) return;

    const selector = `#status-list [data-index="${index}"] .focusable`;
    const element = document.querySelector<HTMLDivElement>(selector);

    if (element) {
      element.focus();
      return true;
    }
    return false;
  };

  const renderEntry = (entry: TimelineEntry) => {
    if (entry.type === 'status') {
      return (
        <TimelineStatus
          key={entry.id}
          id={entry.id}
          isConnectedTop={entry.isConnectedTop}
          isConnectedBottom={entry.isConnectedBottom}
          rebloggedBy={entry.rebloggedBy}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          // contextType={timelineId}
          // showGroup={showGroup}
          // variant={divideType === 'border' ? 'slim' : 'rounded'}
          // fromBookmarks={other.scrollKey === 'bookmarked_statuses'}
        />
      );
    }
    if (entry.type === 'page-end' || entry.type === 'page-start') {
      return (
        <div className='m-4'>
          <LoadMore key='load-more' onClick={() => handleLoadMore(entry)} disabled={isLoading} />
        </div>
      );
    }
  };

  return (
    <ScrollableList
      id='status-list'
      key='scrollable-list'
      isLoading={isLoading}
      showLoading={isLoading && !data}
      placeholderComponent={() => <PlaceholderStatus variant={'slim'} />}
      placeholderCount={20}
      // className={className}
      // listClassName={clsx('divide-y divide-solid divide-gray-200 dark:divide-gray-800', {
      //   'divide-none': divideType !== 'border',
      // })}
      // itemClassName={clsx({
      //   'pb-3': divideType !== 'border',
      // })}
      // {...other}
    >
      {(data || []).map(renderEntry)}
    </ScrollableList>
  );
};

export { NewTimeline };
