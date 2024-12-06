import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Modal from 'pl-fe/components/ui/modal';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

import type { BaseModalProps } from '../modal-root';

const Hotkey: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className='rounded-md border border-solid border-primary-200 bg-primary-50 px-1.5 py-1 font-sans text-xs dark:border-gray-700 dark:bg-gray-800'>
    {children}
  </kbd>
);

const TableCell: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <td className={clsx(className, 'px-2 pb-3')}>
    {children}
  </td>
);

const getColumnSizes = (n: number) => {
  let part1 = Math.ceil(n / 3);
  let part2 = Math.floor(n / 3);
  const part3 = Math.floor(n / 3);

  const total = part1 + part2 + part3;
  if (total < n) {
    part2++;
  } else if (total > n) {
    part1--;
  }

  // Return the parts in descending order
  return [part1, part2, part3];
};

const HotkeysModal: React.FC<BaseModalProps> = ({ onClose }) => {
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();

  const hotkeys = [
    isLoggedIn && {
      key: <Hotkey>r</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.reply' defaultMessage='to reply' />,
    },
    isLoggedIn && {
      key: <Hotkey>m</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.mention' defaultMessage='to mention author' />,
    },
    {
      key: <Hotkey>p</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.profile' defaultMessage="to open author's profile" />,
    },
    isLoggedIn && {
      key: <Hotkey>f</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.favourite' defaultMessage='to like' />,
    },
    isLoggedIn && features.emojiReacts && {
      key: <Hotkey>e</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.react' defaultMessage='to react' />,
    },
    isLoggedIn && {
      key: <Hotkey>b</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.boost' defaultMessage='to repost' />,
    },
    {
      key: <><Hotkey>enter</Hotkey>, <Hotkey>o</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.enter' defaultMessage='to open post' />,
    },
    {
      key: <Hotkey>a</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.open_media' defaultMessage='to open media' />,
    },
    features.spoilers && {
      key: <Hotkey>x</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.toggle_hidden' defaultMessage='to show/hide text behind CW' />,
    },
    features.spoilers && {
      key: <Hotkey>h</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.toggle_sensitivity' defaultMessage='to show/hide media' />,
    },
    {
      key: <><Hotkey>up</Hotkey>, <Hotkey>k</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.up' defaultMessage='to move up in the list' />,
    },
    {
      key: <><Hotkey>down</Hotkey>, <Hotkey>j</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.down' defaultMessage='to move down in the list' />,
    },
    isLoggedIn && {
      key: <Hotkey>n</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.compose' defaultMessage='to open the compose textarea' />,
    },
    isLoggedIn && {
      key: <><Hotkey>alt</Hotkey> + <Hotkey>n</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.toot' defaultMessage='to start a new post' />,
    },
    {
      key: <Hotkey>backspace</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.back' defaultMessage='to navigate back' />,
    },
    isLoggedIn && {
      key: <><Hotkey>s</Hotkey>, <Hotkey>/</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.search' defaultMessage='to focus search' />,
    },
    {
      key: <Hotkey>esc</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.unfocus' defaultMessage='to un-focus compose textarea/search' />,
    },
    isLoggedIn && {
      key: <><Hotkey>g</Hotkey> + <Hotkey>h</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.home' defaultMessage='to open home timeline' />,
    },
    isLoggedIn && {
      key: <><Hotkey>g</Hotkey> + <Hotkey>n</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.notifications' defaultMessage='to open notifications list' />,
    },
    isLoggedIn && {
      key: <><Hotkey>g</Hotkey> + <Hotkey>f</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.favourites' defaultMessage='to open likes list' />,
    },
    isLoggedIn && {
      key: <><Hotkey>g</Hotkey> + <Hotkey>p</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.my_profile' defaultMessage='to open your profile' />,
    },
    isLoggedIn && {
      key: <><Hotkey>g</Hotkey> + <Hotkey>b</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.blocked' defaultMessage='to open blocked users list' />,
    },
    isLoggedIn && {
      key: <><Hotkey>g</Hotkey> + <Hotkey>m</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.muted' defaultMessage='to open muted users list' />,
    },
    isLoggedIn && features.followRequests && {
      key: <><Hotkey>g</Hotkey> + <Hotkey>r</Hotkey></>,
      label: <FormattedMessage id='keyboard_shortcuts.requests' defaultMessage='to open follow requests list' />,
    },
    {
      key: <Hotkey>?</Hotkey>,
      label: <FormattedMessage id='keyboard_shortcuts.legend' defaultMessage='to display this legend' />,
    },
  ].filter(hotkey => hotkey !== false);

  const columnSizes = getColumnSizes(hotkeys.length);

  const columns = columnSizes.reduce<Array<Array<{
    key: JSX.Element;
    label: JSX.Element;
  }>>>((prev, cur) => {
    const addedItems = prev.flat().length;
    prev.push(hotkeys.slice(addedItems, addedItems + cur));
    return prev;
  }, []);

  return (
    <Modal
      title={<FormattedMessage id='keyboard_shortcuts.heading' defaultMessage='Keyboard shortcuts' />}
      onClose={onClose}
      width='4xl'
    >
      <div className='flex flex-col text-xs lg:flex-row'>
        {columns.map((column, i) => (
          <table key={i}>
            <thead>
              <tr>
                <th className='pb-2 font-bold'><FormattedMessage id='keyboard_shortcuts.hotkey' defaultMessage='Hotkey' /></th>
              </tr>
            </thead>
            <tbody>
              {column.map((hotkey, i) => (
                <tr key={i}>
                  <TableCell className='whitespace-nowrap'>{hotkey.key}</TableCell>
                  <TableCell>{hotkey.label}</TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </Modal>
  );
};

export { HotkeysModal as default };
