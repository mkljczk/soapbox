import clsx from 'clsx';
import throttle from 'lodash/throttle';
import React, { useEffect, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { createSelector } from 'reselect';

import { fetchOwnAccounts, logOut, switchAccount } from 'pl-fe/actions/auth';
import Account from 'pl-fe/components/account';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import { Entities } from 'pl-fe/entity-store/entities';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { RootState } from 'pl-fe/store';

import ThemeToggle from './theme-toggle';

import type { Account as AccountEntity } from 'pl-fe/normalizers/account';

const messages = defineMessages({
  add: { id: 'profile_dropdown.add_account', defaultMessage: 'Add an existing account' },
  theme: { id: 'profile_dropdown.theme', defaultMessage: 'Theme' },
  logout: { id: 'profile_dropdown.logout', defaultMessage: 'Log out @{acct}' },
});

interface IProfileDropdown {
  account: AccountEntity;
  children: React.ReactNode;
}

type IMenuItem = {
  text: string | React.ReactElement | null;
  to?: string;
  toggle?: JSX.Element;
  icon?: string;
  action?: (event: React.MouseEvent) => void;
}


const getOtherAccounts = createSelector([
  (state: RootState) => state.auth.users,
  (state: RootState) => state.entities[Entities.ACCOUNTS]?.store,
], (signedAccounts, accountEntities) => signedAccounts.toArray().map(([_, { id }]) => accountEntities?.[id] as AccountEntity).filter(account => account));

const ProfileDropdown: React.FC<IProfileDropdown> = ({ account, children }) => {
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const intl = useIntl();

  const otherAccounts = useAppSelector(getOtherAccounts);

  const handleLogOut = () => {
    dispatch(logOut());
  };

  const handleSwitchAccount = (account: AccountEntity) => () => {
    dispatch(switchAccount(account.id));
  };

  const fetchOwnAccountThrottled = throttle(() => {
    dispatch(fetchOwnAccounts());
  }, 2000);

  const renderAccount = (account: AccountEntity) => (
    <Account account={account} showAccountHoverCard={false} withLinkToProfile={false} hideActions />
  );

  const ProfileDropdownMenu = useMemo(() => {
    const menu: IMenuItem[] = [];

    menu.push({ text: renderAccount(account), to: `/@${account.acct}` });

    otherAccounts.forEach((otherAccount?: AccountEntity) => {
      if (otherAccount && otherAccount.id !== account.id) {
        menu.push({
          text: renderAccount(otherAccount),
          action: handleSwitchAccount(otherAccount),
        });
      }
    });

    menu.push({ text: null });
    menu.push({ text: intl.formatMessage(messages.theme), toggle: <ThemeToggle /> });
    menu.push({ text: null });

    menu.push({
      text: intl.formatMessage(messages.add),
      to: '/login/add',
      icon: require('@tabler/icons/outline/plus.svg'),
    });

    menu.push({
      text: intl.formatMessage(messages.logout, { acct: account.acct }),
      to: '/logout',
      action: handleLogOut,
      icon: require('@tabler/icons/outline/logout.svg'),
    });

    return () => (
      <>
        {menu.map((menuItem, i) => (
          <MenuItem key={i} menuItem={menuItem} />
        ))}
      </>
    );
  }, [account, otherAccounts.length, features]);

  useEffect(() => {
    fetchOwnAccountThrottled();
  }, [account.id, otherAccounts.length]);

  return (
    <DropdownMenu
      component={ProfileDropdownMenu}
    >
      <button
        className='w-full rounded-full focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-gray-800 dark:ring-offset-0 dark:focus:ring-primary-500'
        type='button'
      >
        {children}
      </button>
    </DropdownMenu>
  );
};

interface MenuItemProps {
  className?: string;
  menuItem: IMenuItem;
}

const MenuItem: React.FC<MenuItemProps> = ({ className, menuItem }) => {
  const baseClassName = clsx(className, 'block w-full cursor-pointer truncate px-4 py-2.5 text-left text-sm text-gray-700 outline-none hover:bg-gray-100 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:text-gray-500 dark:hover:bg-gray-800 dark:focus:ring-offset-0 rtl:text-right');

  if (menuItem.toggle) {
    return (
      <div className='flex flex-row items-center justify-between space-x-4 px-4 py-1 text-sm text-gray-700 dark:text-gray-400'>
        <span>{menuItem.text}</span>

        {menuItem.toggle}
      </div>
    );
  } else if (!menuItem.text) {
    return <hr className='mx-2 my-1 border-t-2 border-gray-100 black:border-t dark:border-gray-800' />;
  } else if (menuItem.action) {
    return (
      <button
        type='button'
        onClick={menuItem.action}
        className={baseClassName}
      >
        {menuItem.text}
      </button>
    );
  } else if (menuItem.to) {
    return (
      <Link
        to={menuItem.to}
        className={baseClassName}
      >
        {menuItem.text}
      </Link>
    );
  } else {
    throw menuItem;
  }
};

export { ProfileDropdown as default };
