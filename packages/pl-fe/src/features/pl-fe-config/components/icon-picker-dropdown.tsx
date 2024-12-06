import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import ForkAwesomeIcon from 'pl-fe/components/fork-awesome-icon';
import Popover from 'pl-fe/components/ui/popover';

import IconPickerMenu from './icon-picker-menu';

const messages = defineMessages({
  emoji: { id: 'icon_button.label', defaultMessage: 'Select icon' },
});

interface IIconPickerDropdown {
  value: string;
  onPickIcon: (icon: string) => void;
}

const IconPickerDropdown: React.FC<IIconPickerDropdown> = ({ value, onPickIcon }) => {
  const intl = useIntl();

  const title = intl.formatMessage(messages.emoji);
  const forkAwesomeIcons = require('../forkawesome.json');

  return (
    <div>
      <Popover
        interaction='click'
        content={
          <IconPickerMenu
            icons={forkAwesomeIcons}
            onPick={onPickIcon}
          />
        }
        isFlush
      >
        <div
          className='flex size-[38px] cursor-pointer items-center justify-center text-lg'
          title={title}
          aria-label={title}
          role='button'
          tabIndex={0}
        >
          <ForkAwesomeIcon id={value} />
        </div>

      </Popover>
    </div>
  );
};

export { IconPickerDropdown as default };
