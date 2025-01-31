/* eslint-disable react-hooks/rules-of-hooks */
import { useVirtualizer, useWindowVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef } from 'react';

import LoadMore from 'pl-fe/components/load-more';
import Card from 'pl-fe/components/ui/card';
import Spinner from 'pl-fe/components/ui/spinner';
import { useSettings } from 'pl-fe/hooks/use-settings';

// Workaround for timeline jump issue from https://github.com/TanStack/virtual/issues/659
const measureElement = (
  element: Element,
  entry: ResizeObserverEntry | undefined,
  instance: Virtualizer<HTMLElement, Element> | Virtualizer<Window, Element>,
) => {
  const direction = instance.scrollDirection;
  if (direction === 'forward' || direction === null) {
    return element.scrollHeight;
  } else {
    // don't remeasure if we are scrolling up
    const indexKey = Number(element.getAttribute('data-index'));
    // @ts-ignore
    const cacheMeasurement = instance.itemSizeCache.get(indexKey);
    return cacheMeasurement;
  }
};

interface IScrollableListBase {
  /** Pagination callback when the end of the list is reached. */
  onLoadMore?: () => void;
  /** Whether the data is currently being fetched. */
  isLoading?: boolean;
  /** Whether to actually display the loading state. */
  showLoading?: boolean;
  /** Whether we expect an additional page of data. */
  hasMore?: boolean;
  /** Additional element to display at the top of the list. */
  prepend?: React.ReactNode;
  /** Whether to display the prepended element. */
  alwaysPrepend?: boolean;
  /** Message to display when the list is loaded but empty. */
  emptyMessage?: React.ReactNode;
  /** Should the empty message be displayed in a Card */
  emptyMessageCard?: boolean;
  /** Scrollable content. */
  children: Iterable<React.ReactNode>;
  /** Callback when the list is scrolled. */
  onScroll?: (startIndex?: number, endIndex?: number) => void;
  /** Placeholder component to render while loading. */
  placeholderComponent?: React.ComponentType | React.NamedExoticComponent;
  /** Number of placeholders to render while loading. */
  placeholderCount?: number;
  /** Extra class names on the list element. */
  listClassName?: string;
  /** Class names on each item container. */
  itemClassName?: string;
  /** Extra class names on the LoadMore element */
  loadMoreClassName?: string;
  /** `id` attribute on the parent element. */
  id?: string;
  /** Initial item index to scroll to. */
  initialIndex?: number;
  /** Estimated size for items. */
  estimatedSize?: number;
  /** Align the items to the bottom of the list. */
  alignToBottom?: boolean;
}

interface IScrollableListWithContainer extends IScrollableListBase {
  /** Extra class names on the container element. */
  className?: string;
  /** CSS styles on the container element. */
  style?: React.CSSProperties;
}

interface IScrollableListWithoutContainer extends IScrollableListBase {
  parentRef: React.RefObject<HTMLElement>;
}

type IScrollableList = IScrollableListWithContainer | IScrollableListWithoutContainer;

const ScrollableList = React.forwardRef<Virtualizer<any, any>, IScrollableList>(({
  prepend = null,
  alwaysPrepend,
  children,
  isLoading,
  emptyMessage,
  emptyMessageCard = true,
  showLoading,
  onScroll,
  onLoadMore,
  listClassName,
  itemClassName,
  loadMoreClassName,
  id,
  hasMore,
  placeholderComponent: Placeholder,
  placeholderCount = 0,
  initialIndex,
  estimatedSize = 300,
  alignToBottom,
  ...props
}, ref) => {
  const listRef = useRef<HTMLDivElement>(null);

  const { autoloadMore } = useSettings();

  /** Normalized children. */
  const elements = Array.from(children || []);

  const showPlaceholder = showLoading && Placeholder && placeholderCount > 0;

  const data = showPlaceholder ? Array(placeholderCount).fill('') : elements;

  const virtualizer = 'parentRef' in props ? useVirtualizer({
    count: data.length + (hasMore ? 1 : 0),
    overscan: 1,
    estimateSize: () => estimatedSize,
    getScrollElement: () => props.parentRef.current,
    measureElement,
  }) : useWindowVirtualizer({
    count: data.length + (hasMore ? 1 : 0),
    overscan: 1,
    estimateSize: () => estimatedSize,
    scrollMargin: listRef.current ? listRef.current.getBoundingClientRect().top + window.scrollY : 0,
    measureElement,
  });

  useEffect(() => {
    if (typeof ref === 'function') ref(virtualizer); else if (ref !== null) ref.current = virtualizer;
  }, [virtualizer]);

  const range = virtualizer.calculateRange();

  useEffect(() => {
    if (showLoading) return;

    if (typeof initialIndex === 'number') virtualizer.scrollToIndex(initialIndex);
  }, [showLoading, initialIndex]);

  useEffect(() => {
    onScroll?.(range?.startIndex, range?.endIndex);
  }, [range?.startIndex, range?.endIndex]);

  useEffect(() => {
    if (onLoadMore && range?.endIndex === data.length && !showLoading && autoloadMore && hasMore) {
      onLoadMore();
    }
  }, [range?.endIndex]);

  const loadMore = useMemo(() => {
    if (autoloadMore || !hasMore || !onLoadMore) {
      return null;
    } else {
      const button = <LoadMore className='mt-4' visible={!isLoading} onClick={onLoadMore} />;

      if (loadMoreClassName) return <div className={loadMoreClassName}>{button}</div>;

      return button;
    }
  }, [autoloadMore, hasMore, isLoading]);

  /* Render an empty state instead of the scrollable list. */
  const renderEmpty = (): JSX.Element => (
    <div className='mt-2'>
      {alwaysPrepend && prepend}

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {emptyMessageCard ? (
            <Card variant='rounded' size='lg'>
              {emptyMessage}
            </Card>
          ) : emptyMessage}
        </>
      )}
    </div>
  );

  const renderItem = (index: number): JSX.Element => {
    const PlaceholderComponent = Placeholder || Spinner;
    if (alignToBottom && hasMore ? index === 0 : index === data.length) return (isLoading) ? <PlaceholderComponent /> : loadMore || <div className='h-4' />;
    if (showPlaceholder) return <PlaceholderComponent />;
    return data[alignToBottom && hasMore ? index - 1 : index];
  };

  const virtualItems = virtualizer.getVirtualItems();

  const body = (
    <div
      ref={listRef}
      id={'parentRef' in props ? id : undefined}
      className={listClassName}
      style={{
        height: (!showLoading || showPlaceholder) && data.length ? virtualizer.getTotalSize() : undefined,
        width: '100%',
        position: 'relative',
      }}
    >
      {(!showLoading || showPlaceholder) && data.length ? (
        <>
          {prepend}
          {virtualItems.map((item) => (
            <div
              className={item.index === data.length ? '' : itemClassName}
              key={item.key as number}
              data-index={item.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                width: '100%',
                transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              {renderItem(item.index)}
            </div>
          ))}
        </>
      ) : renderEmpty()}
    </div>
  );

  if ('parentRef' in props) return body;

  return (
    <div
      id={id}
      className={clsx(props.className, 'w-full')}
      style={props.style}
    >
      {body}
    </div>
  );
});

export {
  type IScrollableList,
  type IScrollableListWithContainer,
  type IScrollableListWithoutContainer,
  ScrollableList as default,
};
