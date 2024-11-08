import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import DropdownMenu from 'pl-fe/components/dropdown-menu';

import HStack from './hstack';
import Icon from './icon';
import Text from './text';

import type { Menu } from 'pl-fe/components/dropdown-menu';

const messages = defineMessages({
  collapse: { id: 'accordion.collapse', defaultMessage: 'Collapse' },
  expand: { id: 'accordion.expand', defaultMessage: 'Expand' },
});

interface IAccordion {
  headline: React.ReactNode;
  children?: React.ReactNode;
  menu?: Menu;
  expanded?: boolean;
  onToggle?: (value: boolean) => void;
  action?: () => void;
  actionIcon?: string;
  actionLabel?: string;
}

/**
 * Accordion
 * An accordion is a vertically stacked group of collapsible sections.
 */
const Accordion: React.FC<IAccordion> = ({ headline, children, menu, expanded = false, onToggle = () => {}, action, actionIcon, actionLabel }) => {
  const intl = useIntl();

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    onToggle(!expanded);
    e.preventDefault();
  };

  const handleAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!action) return;

    action();
    e.preventDefault();
  };

  return (
    <div className='rounded-lg bg-white text-gray-900 shadow dark:bg-primary-800 dark:text-gray-100 dark:shadow-none'>
      <button
        type='button'
        onClick={handleToggle}
        title={intl.formatMessage(expanded ? messages.collapse : messages.expand)}
        aria-expanded={expanded}
        className='flex w-full items-center justify-between px-4 py-3 font-semibold'
      >
        <span>{headline}</span>

        <HStack alignItems='center' space={2}>
          {menu && (
            <DropdownMenu
              items={menu}
              src={require('@fluentui/more_vertical_24_regular.svg')}
            />
          )}
          {action && actionIcon && (
            <button onClick={handleAction} title={actionLabel}>
              <Icon
                src={actionIcon}
                className='size-5 text-gray-700 dark:text-gray-600'
              />
            </button>
          )}
          <Icon
            src={expanded ? require('@fluentui/chevron_up_24_regular.svg') : require('@fluentui/chevron_down_24_regular.svg')}
            className='size-5 text-gray-700 dark:text-gray-600'
          />
        </HStack>
      </button>

      <div
        className={
          clsx({
            'p-4 rounded-b-lg border-t border-solid border-gray-100 dark:border-primary-900 black:border-black': true,
            'h-0 hidden': !expanded,
          })
        }
      >
        <Text>{children}</Text>
      </div>
    </div>
  );
};

export { Accordion as default };
