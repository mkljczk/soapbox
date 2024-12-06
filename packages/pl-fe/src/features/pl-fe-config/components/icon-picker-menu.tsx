import clsx from 'clsx';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Text from 'pl-fe/components/ui/text';

const messages = defineMessages({
  emoji: { id: 'icon_button.label', defaultMessage: 'Select icon' },
});

interface IIconPickerMenu {
  icons: Record<string, Array<string>>;
  onPick: (icon: string) => void;
  style?: React.CSSProperties;
}

const IconPickerMenu: React.FC<IIconPickerMenu> = ({ icons, onPick, style }) => {
  const intl = useIntl();

  const setRef = (c: HTMLDivElement) => {
    if (!c) return;

    // Nice and dirty hack to display the icons
    c.querySelectorAll('button.emoji-mart-emoji > img').forEach(elem => {
      const newIcon = document.createElement('span');
      newIcon.innerHTML = `<i class="fa fa-${(elem.parentNode as any).getAttribute('title')} fa-hack"></i>`;
      (elem.parentNode as any).replaceChild(newIcon, elem);
    });
  };

  const handleClick = (icon: string) => {
    onPick(icon);
  };

  const renderIcon = (icon: string) => {
    const name = icon.replace('fa fa-', '');

    return (
      <li key={icon} className='col-span-1 inline-block'>
        <button
          className='flex items-center justify-center rounded-full p-1.5 hover:bg-gray-50 dark:hover:bg-primary-800'
          aria-label={name}
          title={name}
          onClick={() => handleClick(name)}
        >
          <i className={clsx(icon, 'size-[1.375rem] text-lg leading-[1.15]')} />
        </button>
      </li>
    );
  };

  const title = intl.formatMessage(messages.emoji);

  return (
    <div
      className='h-[270px] overflow-x-hidden overflow-y-scroll rounded bg-white p-1.5 text-gray-900 dark:bg-primary-900 dark:text-gray-100'
      aria-label={title}
      ref={setRef}
    >
      <Text className='px-1.5 py-1'><FormattedMessage id='icon_button.icons' defaultMessage='Icons' /></Text>
      <ul className='grid grid-cols-8'>
        {Object.values(icons).flat().map(icon => renderIcon(icon))}
      </ul>
    </div>
  );
};

export { IconPickerMenu as default };
