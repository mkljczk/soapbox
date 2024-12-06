import clsx from 'clsx';
import React from 'react';

import Icon from 'pl-fe/components/icon';

interface IIconButton extends Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'disabled' | 'onClick' | 'onKeyDown' | 'onKeyPress' | 'onKeyUp' | 'onMouseDown' | 'onMouseEnter' | 'onMouseLeave' | 'tabIndex' | 'title'> {
  active?: boolean;
  expanded?: boolean;
  iconClassName?: string;
  pressed?: boolean;
  src: string;
  text?: React.ReactNode;
}

const IconButton: React.FC<IIconButton> = ({
  active,
  className,
  disabled,
  expanded,
  iconClassName,
  onClick,
  onKeyDown,
  onKeyUp,
  onKeyPress,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  pressed,
  src,
  tabIndex = 0,
  text,
  title,
}) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();

    if (!disabled && onClick) {
      onClick(e);
    }
  };

  const handleMouseDown: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!disabled && onMouseDown) {
      onMouseDown(e);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (!disabled && onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleKeyUp: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (!disabled && onKeyUp) {
      onKeyUp(e);
    }
  };

  const handleKeyPress: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (onKeyPress && !disabled) {
      onKeyPress(e);
    }
  };

  const classes = clsx(className, 'icon-button', {
    active,
    'opacity-20 cursor-default': disabled,
  });

  return (
    <button
      aria-label={title}
      aria-pressed={pressed}
      aria-expanded={expanded}
      title={title}
      className={classes}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onKeyPress={handleKeyPress}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={tabIndex}
      disabled={disabled}
      type='button'
    >
      <div className='flex items-center justify-center'>
        <Icon className={iconClassName} src={src} aria-hidden='true' />
      </div>
      {text && <span className='pl-0.5'>{text}</span>}
    </button>
  );
};

export { IconButton as default };
