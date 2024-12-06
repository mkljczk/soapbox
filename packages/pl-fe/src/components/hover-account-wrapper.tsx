import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useRef } from 'react';

import { fetchAccount } from 'pl-fe/actions/accounts';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { isMobile } from 'pl-fe/is-mobile';
import { useAccountHoverCardStore } from 'pl-fe/stores/account-hover-card';

const showAccountHoverCard = debounce((openAccountHoverCard, ref, accountId) => {
  openAccountHoverCard(ref, accountId);
}, 600);

interface IHoverAccountWrapper {
  accountId: string;
  element?: 'div' | 'span' | 'bdi';
  className?: string;
  children: React.ReactNode;
}

/** Makes a profile hover card appear when the wrapped element is hovered. */
const HoverAccountWrapper: React.FC<IHoverAccountWrapper> = ({ accountId, children, element: Elem = 'div', className }) => {
  const dispatch = useAppDispatch();

  const { openAccountHoverCard, closeAccountHoverCard } = useAccountHoverCardStore();

  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!isMobile(window.innerWidth)) {
      dispatch(fetchAccount(accountId));
      showAccountHoverCard(openAccountHoverCard, ref, accountId);
    }
  };

  const handleMouseLeave = () => {
    showAccountHoverCard.cancel();
    setTimeout(() => closeAccountHoverCard(), 300);
  };

  const handleClick = () => {
    showAccountHoverCard.cancel();
    closeAccountHoverCard(true);
  };

  return (
    <Elem
      ref={ref}
      className={clsx('hover-account-wrapper', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
    </Elem>
  );
};

export { HoverAccountWrapper as default, showAccountHoverCard };
