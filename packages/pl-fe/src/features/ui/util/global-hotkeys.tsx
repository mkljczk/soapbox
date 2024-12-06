import React, { useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { resetCompose } from 'pl-fe/actions/compose';
import { FOCUS_EDITOR_COMMAND } from 'pl-fe/features/compose/editor/plugins/focus-plugin';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useModalsStore } from 'pl-fe/stores/modals';

import { HotKeys } from '../components/hotkeys';

import type { LexicalEditor } from 'lexical';

const keyMap = {
  help: '?',
  new: 'n',
  search: ['/', 's'],
  forceNew: 'option+n',
  reply: 'r',
  favourite: 'f',
  react: 'e',
  boost: 'b',
  mention: 'm',
  open: ['enter', 'o'],
  openProfile: 'p',
  moveDown: ['down', 'j'],
  moveUp: ['up', 'k'],
  back: 'backspace',
  goToHome: 'g h',
  goToNotifications: 'g n',
  goToFavourites: 'g f',
  goToProfile: ['g p', 'g u'],
  goToBlocked: 'g b',
  goToMuted: 'g m',
  goToRequests: 'g r',
  toggleSensitive: ['h', 'x'],
  openMedia: 'a',
};

interface IGlobalHotkeys {
  children: React.ReactNode;
  node: React.MutableRefObject<HTMLDivElement | null>;
}

const GlobalHotkeys: React.FC<IGlobalHotkeys> = ({ children, node }) => {
  const hotkeys = useRef<HTMLDivElement | null>(null);

  const history = useHistory();
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();
  const { openModal } = useModalsStore();

  const setHotkeysRef: React.LegacyRef<typeof HotKeys> = (c: any) => {
    hotkeys.current = c;

    if (!account || !hotkeys.current) return;

    // @ts-ignore
    hotkeys.current.__mousetrap__.stopCallback = (_e, element) =>
      ['TEXTAREA', 'SELECT', 'INPUT', 'EM-EMOJI-PICKER'].includes(element.tagName) || !!element.closest('[contenteditable]');
  };

  const handlers = useMemo(() => {
    const handleHotkeyNew = (e?: KeyboardEvent) => {
      e?.preventDefault();

      const element = node.current?.querySelector('div[data-lexical-editor="true"]') as HTMLTextAreaElement;

      if (element) {
        ((element as any).__lexicalEditor as LexicalEditor).dispatchCommand(FOCUS_EDITOR_COMMAND, undefined);
      } else {
        openModal('COMPOSE');
      }
    };

    const handleHotkeySearch = (e?: KeyboardEvent) => {
      e?.preventDefault();
      if (!node.current) return;

      const element = node.current.querySelector('input#search') as HTMLInputElement;

      if (element?.checkVisibility()) {
        element.focus();
      } else {
        history.push('/search');
      }
    };

    const handleHotkeyForceNew = (e?: KeyboardEvent) => {
      handleHotkeyNew(e);
      dispatch(resetCompose());
    };

    const handleHotkeyBack = () => {
      if (window.history && window.history.length === 1) {
        history.push('/');
      } else {
        history.goBack();
      }
    };

    const handleHotkeyToggleHelp = () => {
      openModal('HOTKEYS');
    };

    const handleHotkeyGoToHome = () => {
      history.push('/');
    };

    const handleHotkeyGoToNotifications = () => {
      history.push('/notifications');
    };

    const handleHotkeyGoToFavourites = () => {
      if (!account) return;
      history.push(`/@${account.username}/favorites`);
    };

    const handleHotkeyGoToProfile = () => {
      if (!account) return;
      history.push(`/@${account.username}`);
    };

    const handleHotkeyGoToBlocked = () => {
      history.push('/blocks');
    };

    const handleHotkeyGoToMuted = () => {
      history.push('/mutes');
    };

    const handleHotkeyGoToRequests = () => {
      history.push('/follow_requests');
    };

    type HotkeyHandlers = { [key: string]: (keyEvent?: KeyboardEvent) => void };

    let handlers: HotkeyHandlers = {
      help: handleHotkeyToggleHelp,
      search: handleHotkeySearch,
      back: handleHotkeyBack,
    };

    if (account) {
      handlers = {
        ...handlers,
        new: handleHotkeyNew,
        forceNew: handleHotkeyForceNew,
        goToHome: handleHotkeyGoToHome,
        goToNotifications: handleHotkeyGoToNotifications,
        goToFavourites: handleHotkeyGoToFavourites,
        goToProfile: handleHotkeyGoToProfile,
        goToBlocked: handleHotkeyGoToBlocked,
        goToMuted: handleHotkeyGoToMuted,
        goToRequests: handleHotkeyGoToRequests,
      };
    }
    return handlers;
  }, [account?.id]);

  return (
    <HotKeys keyMap={keyMap} handlers={handlers} ref={setHotkeysRef} attach={window} focused>
      {children}
    </HotKeys>
  );
};

export default GlobalHotkeys;
