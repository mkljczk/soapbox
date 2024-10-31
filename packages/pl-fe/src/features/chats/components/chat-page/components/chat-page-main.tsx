import React, { useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link, useHistory, useParams } from 'react-router-dom';

import { blockAccount, unblockAccount } from 'pl-fe/actions/accounts';
import DropdownMenu, { type Menu } from 'pl-fe/components/dropdown-menu';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import VerificationBadge from 'pl-fe/components/verification-badge';
import { useChatContext } from 'pl-fe/contexts/chat-context';
import { Entities } from 'pl-fe/entity-store/entities';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useChat, useChatActions, useChats } from 'pl-fe/queries/chats';
import { useModalsStore } from 'pl-fe/stores/modals';

import Chat from '../../chat';

import BlankslateEmpty from './blankslate-empty';
import BlankslateWithChats from './blankslate-with-chats';

import type { Relationship } from 'pl-api';

const messages = defineMessages({
  blockMessage: { id: 'chat_settings.block.message', defaultMessage: 'Blocking will prevent this profile from direct messaging you and viewing your content. You can unblock later.' },
  blockHeading: { id: 'chat_settings.block.heading', defaultMessage: 'Block @{acct}' },
  blockConfirm: { id: 'chat_settings.block.confirm', defaultMessage: 'Block' },
  unblockMessage: { id: 'chat_settings.unblock.message', defaultMessage: 'Unblocking will allow this profile to direct message you and view your content.' },
  unblockHeading: { id: 'chat_settings.unblock.heading', defaultMessage: 'Unblock @{acct}' },
  unblockConfirm: { id: 'chat_settings.unblock.confirm', defaultMessage: 'Unblock' },
  leaveMessage: { id: 'chat_settings.leave.message', defaultMessage: 'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.' },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave chat' },
  blockUser: { id: 'chat_settings.options.block_user', defaultMessage: 'Block @{acct}' },
  unblockUser: { id: 'chat_settings.options.unblock_user', defaultMessage: 'Unblock @{acct}' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave chat' },
});

const ChatPageMain = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();
  const history = useHistory();

  const { chatId } = useParams<{ chatId: string }>();

  const { openModal } = useModalsStore();
  const { data: chat } = useChat(chatId);
  const { currentChatId } = useChatContext();
  const { chatsQuery: { data: chats, isLoading } } = useChats();

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const { deleteChat } = useChatActions(chat?.id as string);

  const isBlocking = !!useAppSelector((state) => chat?.account?.id && (state.entities[Entities.RELATIONSHIPS]?.store[chat.account.id] as Relationship)?.blocked_by);

  const handleBlockUser = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.blockHeading, { acct: chat?.account.acct }),
      message: intl.formatMessage(messages.blockMessage),
      confirm: intl.formatMessage(messages.blockConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => dispatch(blockAccount(chat?.account.id as string)),
    });
  };

  const handleUnblockUser = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.unblockHeading, { acct: chat?.account.acct }),
      message: intl.formatMessage(messages.unblockMessage),
      confirm: intl.formatMessage(messages.unblockConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => dispatch(unblockAccount(chat?.account.id as string)),
    });
  };

  const handleLeaveChat = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.leaveHeading),
      message: intl.formatMessage(messages.leaveMessage),
      confirm: intl.formatMessage(messages.leaveConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => {
        deleteChat.mutate(undefined, {
          onSuccess() {
            history.push('/chats');
          },
        });
      },
    });
  };

  if (isLoading) {
    return null;
  }

  if (!currentChatId && chats && chats.length > 0) {
    return <BlankslateWithChats />;
  }

  if (!currentChatId) {
    return <BlankslateEmpty />;
  }

  if (!chat) {
    return null;
  }

  const menuItems: Menu = [
    {
      icon: require('@tabler/icons/outline/ban.svg'),
      text: intl.formatMessage(isBlocking ? messages.unblockUser : messages.blockUser, { acct: chat.account.acct }),
      action: isBlocking ? handleUnblockUser : handleBlockUser,
    },
  ];

  if (features.chatsDelete) menuItems.push({
    icon: require('@tabler/icons/outline/logout.svg'),
    text: intl.formatMessage(messages.leaveChat),
    action: handleLeaveChat,
  });

  return (
    <Stack className='h-full overflow-hidden'>
      <HStack alignItems='center' justifyContent='between' space={2} className='w-full p-4'>
        <HStack alignItems='center' space={2} className='overflow-hidden'>
          <HStack alignItems='center'>
            <IconButton
              src={require('@tabler/icons/outline/arrow-left.svg')}
              className='mr-2 size-7 sm:mr-0 sm:hidden rtl:rotate-180'
              onClick={() => history.push('/chats')}
            />

            <Link to={`/@${chat.account.acct}`}>
              <Avatar src={chat.account.avatar} alt={chat.account.avatar_description} size={40} className='flex-none' />
            </Link>
          </HStack>

          <Stack alignItems='start' className='h-11 overflow-hidden'>
            <div className='flex w-full grow items-center space-x-1'>
              <Link to={`/@${chat.account.acct}`}>
                <Text weight='bold' size='sm' align='left' truncate>
                  {chat.account.display_name || `@${chat.account.username}`}
                </Text>
              </Link>
              {chat.account.verified && <VerificationBadge />}
            </div>
          </Stack>
        </HStack>

        <DropdownMenu
          src={require('@tabler/icons/outline/info-circle.svg')}
          component={() => (
            <HStack className='px-4 py-2' alignItems='center' space={3}>
              <Avatar src={chat.account.avatar_static} alt={chat.account.avatar_description} size={50} />
              <Stack>
                <Text weight='semibold'>{chat.account.display_name}</Text>
                <Text size='sm' theme='primary'>@{chat.account.acct}</Text>
              </Stack>
            </HStack>
          )}
          items={menuItems}
        />
      </HStack>

      <div className='h-full overflow-hidden'>
        <Chat
          className='h-full'
          chat={chat}
          inputRef={inputRef}
        />
      </div>
    </Stack>
  );
};

export { ChatPageMain as default };
