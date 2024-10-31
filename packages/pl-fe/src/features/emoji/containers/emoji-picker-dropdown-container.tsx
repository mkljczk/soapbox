import { useFloating, shift, flip, autoUpdate } from '@floating-ui/react';
import clsx from 'clsx';
import React, { KeyboardEvent, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import IconButton from 'pl-fe/components/ui/icon-button';
import Portal from 'pl-fe/components/ui/portal';
import { useClickOutside } from 'pl-fe/hooks/use-click-outside';

import EmojiPickerDropdown, { IEmojiPickerDropdown } from '../components/emoji-picker-dropdown';

const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
});

interface IEmojiPickerDropdownContainer extends Pick<IEmojiPickerDropdown, 'onPickEmoji' | 'condensed' | 'withCustom'> {
  children?: JSX.Element;
  theme?: 'default' | 'inverse';
}

const EmojiPickerDropdownContainer: React.FC<IEmojiPickerDropdownContainer> = ({ theme = 'default', children, ...props }) => {
  const intl = useIntl();
  const title = intl.formatMessage(messages.emoji);
  const [visible, setVisible] = useState(false);

  const { x, y, strategy, refs, update } = useFloating<HTMLButtonElement>({
    middleware: [flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  useClickOutside(refs, () => {
    setVisible(false);
  });

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setVisible(!visible);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (['Enter', ' '].includes(e.key)) {
      e.stopPropagation();
      e.preventDefault();
      setVisible(!visible);
    }
  };

  return (
    <div className='relative'>
      {children ? (
        React.cloneElement(children, {
          onClick: handleClick,
          onKeyDown: handleKeyDown,
          ref: refs.setReference,
        })
      ) : (
        <IconButton
          theme='transparent'
          className={clsx('emoji-picker-dropdown -m-1 p-2', {
            'text-gray-600 hover:text-gray-800 dark:hover:text-white bg-transparent hover:bg-primary-100 dark:hover:bg-primary-800 black:hover:bg-gray-800': theme === 'default',
            'text-white/80 hover:text-white bg-transparent dark:bg-transparent': theme === 'inverse',
          })}
          ref={refs.setReference}
          src={require('@tabler/icons/outline/mood-smile.svg')}
          title={title}
          aria-label={title}
          aria-expanded={visible}
          role='button'
          onClick={handleClick as any}
          onKeyDown={handleKeyDown as React.KeyboardEventHandler<HTMLButtonElement>}
          tabIndex={0}
        />)}

      {visible && (
        <Portal>
          <div
            className='z-[101]'
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: 'max-content',
            }}
          >
            <EmojiPickerDropdown
              visible
              setVisible={setVisible}
              update={update}
              {...props}
            />
          </div>
        </Portal>
      )}
    </div>
  );
};

export {
  messages,
  EmojiPickerDropdownContainer as default,
};
