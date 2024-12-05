import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BaseModalProps } from '../modal-root';

interface DropdownMenuModalProps {
  content?: JSX.Element;
}

const DropdownMenuModal: React.FC<BaseModalProps & DropdownMenuModalProps> = ({ content, onClose }) => {
  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
    onClose('DROPDOWN_MENU');
    e.stopPropagation();
  };
  const [firstRender, setFirstRender] = React.useState(true);

  const handleClickOutside: React.MouseEventHandler<HTMLElement> = (e) => {
    if ((e.target as HTMLElement).id === 'dropdown-menu-modal') {
      handleClick(e);
    }
  };

  React.useEffect(() => {
    setFirstRender(false);
  }, []);

  return (
    <div
      id='dropdown-menu-modal'
      className='absolute inset-0'
      role='presentation'
      onClick={handleClickOutside}
    >
      <div
        className={clsx('pointer-events-auto fixed inset-x-0 z-[1001] mx-auto max-h-[calc(100dvh-1rem)] w-[calc(100vw-2rem)] max-w-lg overflow-auto rounded-t-xl bg-white py-1 shadow-lg duration-200 ease-in-out focus:outline-none black:bg-black no-reduce-motion:transition-all dark:bg-gray-900 dark:ring-2 dark:ring-primary-700', {
          'bottom-0 opacity-100': !firstRender,
          'no-reduce-motion:-bottom-32 no-reduce-motion:opacity-0': firstRender,
        })}
      >
        {content}
        <div className='p-2 px-3'>
          <button
            className='flex w-full appearance-none place-content-center items-center justify-center rounded-full border border-gray-700 bg-transparent p-2 text-sm font-medium text-gray-700 transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:border-gray-500 dark:text-gray-500'
            onClick={handleClick}
          >
            <FormattedMessage id='lightbox.close' defaultMessage='Close' />
          </button>
        </div>
      </div>
    </div>
  );
};

export { DropdownMenuModal as default, type DropdownMenuModalProps };
