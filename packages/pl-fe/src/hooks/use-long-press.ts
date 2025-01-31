/*
MIT License

Copyright (c) 2023 ui.dev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Adapted from https://github.com/uidotdev/usehooks/pull/321/files
import React from 'react';

type Event = React.MouseEvent | React.TouchEvent;

// eslint-disable-next-line compat/compat
const isTouchEvent = ({ nativeEvent }: Event) => window.TouchEvent
  ? nativeEvent instanceof TouchEvent
  : 'touches' in nativeEvent;

const isMouseEvent = (event: Event) => event.nativeEvent instanceof MouseEvent;

type LongPressOptions = {
  threshold?: number;
  onStart?: (e: Event) => void;
  onFinish?: (e: Event) => void;
  onCancel?: (e: Event) => void;
  allowScroll?: boolean;
  scrollThreshold?: number;
};

const useLongPress = (callback: (e: Event) => void, options: LongPressOptions = {}) => {
  const { threshold = 400, onStart, onFinish, onCancel, allowScroll = false, scrollThreshold = 20 } = options;
  const isLongPressActive = React.useRef(false);
  const isPressed = React.useRef(false);
  const timerId = React.useRef<NodeJS.Timeout>();
  let startY: number;

  return React.useMemo(() => {
    if (typeof callback !== 'function') {
      return {};
    }

    const start = (event: Event) => {
      if (!isMouseEvent(event) && !isTouchEvent(event)) return;

      if ('touches' in event.nativeEvent) {
        startY = event.nativeEvent.touches[0].clientY;
      }

      if (onStart) {
        onStart(event);
      }

      isPressed.current = true;
      timerId.current = setTimeout(() => {
        callback(event);
        isLongPressActive.current = true;
      }, threshold);
    };

    const cancel = (event: Event) => {
      if (!isMouseEvent(event) && !isTouchEvent(event)) return;

      if (isLongPressActive.current) {
        if (onFinish) {
          onFinish(event);
        }
      } else if (isPressed.current) {
        if (onCancel) {
          onCancel(event);
        }
      }

      isLongPressActive.current = false;
      isPressed.current = false;

      if (timerId.current) {
        window.clearTimeout(timerId.current);
      }
    };

    const move = (event: Event) => {
      if (!allowScroll && (!('touches' in event.nativeEvent) || Math.abs(event.nativeEvent.touches[0].clientY - startY) > scrollThreshold)) {
        cancel(event);
      }
    };

    const mouseHandlers = {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onMouseMove: move,
    };

    const touchHandlers = {
      onTouchStart: start,
      onTouchEnd: cancel,
      onTouchMove: move,
    };

    return {
      ...mouseHandlers,
      ...touchHandlers,
    };
  }, [callback, threshold, onCancel, onFinish, onStart]);
};

export { useLongPress };
