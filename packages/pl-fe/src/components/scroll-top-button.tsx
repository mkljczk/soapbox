import clsx from 'clsx';
import throttle from 'lodash/throttle';
import React, { useState, useEffect, useCallback } from 'react';
import { useIntl, MessageDescriptor } from 'react-intl';

import Icon from 'pl-fe/components/ui/icon';
import Text from 'pl-fe/components/ui/text';
import { useSettings } from 'pl-fe/hooks/use-settings';

interface IScrollTopButton {
  /** Callback when clicked, and also when scrolled to the top. */
  onClick: () => void;
  /** Number of unread items. */
  count: number;
  /** Message to display in the button (should contain a `{count}` value). */
  message: MessageDescriptor;
  /** Distance from the top of the screen (scrolling down) before the button appears. */
  threshold?: number;
  /** Distance from the top of the screen (scrolling up) before the action is triggered. */
  autoloadThreshold?: number;
}

/** Floating new post counter above timelines, clicked to scroll to top. */
const ScrollTopButton: React.FC<IScrollTopButton> = ({
  onClick,
  count,
  message,
  threshold = 240,
  autoloadThreshold = 50,
}) => {
  const intl = useIntl();
  const { autoloadTimelines } = useSettings();

  // Whether we are scrolled past the `threshold`.
  const [scrolled, setScrolled] = useState<boolean>(false);
  // Whether we are scrolled above the `autoloadThreshold`.
  const [scrolledTop, setScrolledTop] = useState<boolean>(false);

  const visible = count > 0 && scrolled;

  /** Number of pixels scrolled down from the top of the page. */
  const getScrollTop = (): number => (document.scrollingElement || document.documentElement).scrollTop;

  /** Unload feed items if scrolled to the top. */
  const maybeUnload = useCallback(() => {
    if (autoloadTimelines && scrolledTop && count) {
      onClick();
    }
  }, [autoloadTimelines, scrolledTop, count, onClick]);

  /** Set state while scrolling. */
  const handleScroll = useCallback(throttle(() => {
    const scrollTop = getScrollTop();

    setScrolled(scrollTop > threshold);
    setScrolledTop(scrollTop <= autoloadThreshold);
  }, 40, { trailing: true }), [threshold, autoloadThreshold]);

  /** Scroll to top and trigger `onClick`. */
  const handleClick: React.MouseEventHandler = useCallback(() => {
    window.scrollTo({ top: 0 });
    onClick();
  }, [onClick]);

  useEffect(() => {
    // Delay adding the scroll listener so navigating back doesn't
    // unload feed items before the feed is rendered.
    setTimeout(() => {
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }, 250);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    maybeUnload();
  }, [maybeUnload]);

  return (
    <div
      className={clsx(
        'fixed left-1/2 z-50 -translate-x-1/2 transition-all', {
          'top-2 opacity-100': visible,
          '-top-4 opacity-0': !visible,
        })}
      aria-hidden={!visible}
    >
      <button
        className='flex cursor-pointer items-center space-x-1.5 whitespace-nowrap rounded-full bg-primary-600/80 px-4 py-2 text-white backdrop-blur-md transition-transform hover:scale-105 hover:bg-primary-700/80 active:scale-100'
        onClick={handleClick}
        tabIndex={visible ? 0 : -1}
      >
        <Icon
          className='size-4'
          src={require('@tabler/icons/outline/arrow-bar-to-up.svg')}
        />

        <Text theme='inherit' size='sm'>
          {intl.formatMessage(message, { count })}
        </Text>
      </button>
    </div>
  );
};

export { ScrollTopButton as default };
