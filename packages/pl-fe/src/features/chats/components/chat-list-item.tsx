import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { useRelationship } from 'pl-fe/api/hooks/accounts/use-relationship';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import RelativeTimestamp from 'pl-fe/components/relative-timestamp';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import VerificationBadge from 'pl-fe/components/verification-badge';
import { useChatContext } from 'pl-fe/contexts/chat-context';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useChatActions } from 'pl-fe/queries/chats';
import { useModalsStore } from 'pl-fe/stores/modals';

import type { Chat } from 'pl-api';
import type { Menu } from 'pl-fe/components/dropdown-menu';

const messages = defineMessages({
  blockedYou: { id: 'chat_list_item.blocked_you', defaultMessage: 'This user has blocked you' },
  blocking: { id: 'chat_list_item.blocking', defaultMessage: 'You have blocked this user' },
  leaveMessage: { id: 'chat_settings.leave.message', defaultMessage: 'Are you sure you want to leave this chat? Messages will be deleted for you and this chat will be removed from your inbox.' },
  leaveHeading: { id: 'chat_settings.leave.heading', defaultMessage: 'Leave chat' },
  leaveConfirm: { id: 'chat_settings.leave.confirm', defaultMessage: 'Leave chat' },
  leaveChat: { id: 'chat_settings.options.leave_chat', defaultMessage: 'Leave chat' },
});

interface IChatListItemInterface {
  chat: Chat;
  onClick: (chat: any) => void;
}

const ChatListItem: React.FC<IChatListItemInterface> = ({ chat, onClick }) => {
  const { openModal } = useModalsStore();
  const intl = useIntl();
  const features = useFeatures();
  const history = useHistory();

  const { isUsingMainChatPage } = useChatContext();
  const { deleteChat } = useChatActions(chat?.id as string);
  const { relationship } = useRelationship(chat?.account.id, { enabled: !!chat });

  const isBlocked = relationship?.blocked_by && false;
  const isBlocking = relationship?.blocking && false;

  const menu = useMemo((): Menu => [{
    text: intl.formatMessage(messages.leaveChat),
    action: (event) => {
      event.stopPropagation();

      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.leaveHeading),
        message: intl.formatMessage(messages.leaveMessage),
        confirm: intl.formatMessage(messages.leaveConfirm),
        confirmationTheme: 'primary',
        onConfirm: () => {
          deleteChat.mutate(undefined, {
            onSuccess() {
              if (isUsingMainChatPage) {
                history.push('/chats');
              }
            },
          });
        },
      });
    },
    icon: require('@tabler/icons/outline/logout.svg'),
  }], []);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick(chat);
    }
  };

  return (
    <div
      role='button'
      key={chat.id}
      onClick={() => onClick(chat)}
      onKeyDown={handleKeyDown}
      className='group flex w-full flex-col rounded-lg px-2 py-3 hover:bg-gray-100 focus:shadow-inset-ring dark:hover:bg-gray-800'
      data-testid='chat-list-item'
      tabIndex={0}
    >
      <HStack alignItems='center' justifyContent='between' space={2} className='w-full'>
        <HStack alignItems='center' space={2} className='overflow-hidden'>
          <Avatar
            src={chat.account.avatar}
            alt={chat.account.avatar_description}
            size={40}
            className='flex-none'
          />

          <Stack alignItems='start' className='overflow-hidden'>
            <div className='flex w-full grow items-center space-x-1'>
              <Text weight='bold' size='sm' align='left' truncate>{chat.account?.display_name || `@${chat.account.username}`}</Text>
              {chat.account?.verified && <VerificationBadge />}
            </div>

            {(isBlocked || isBlocking) ? (
              <Text
                align='left'
                size='sm'
                weight='medium'
                theme='muted'
                truncate
                className='pointer-events-none h-5 w-full italic'
                data-testid='chat-last-message'
              >
                {intl.formatMessage(isBlocked ? messages.blockedYou : messages.blocking)}
              </Text>
            ) : (
              <>
                {chat.last_message?.content && (
                  <Text
                    align='left'
                    size='sm'
                    weight='medium'
                    theme={chat.last_message.unread ? 'default' : 'muted'}
                    truncate
                    className='truncate-child pointer-events-none h-5 w-full'
                    data-testid='chat-last-message'
                  >
                    <ParsedContent html={chat.last_message?.content} emojis={chat.last_message.emojis} />
                  </Text>
                )}
              </>
            )}
          </Stack>
        </HStack>

        <HStack alignItems='center' space={2}>
          {features.chatsDelete && (
            <div className='hidden text-gray-600 hover:text-gray-100 group-hover:block'>
              <DropdownMenu items={menu}>
                <IconButton
                  src={require('@fluentui/more_horizontal_24_regular.svg')}
                  title='Settings'
                  className='text-gray-600 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-500'
                  iconClassName='h-4 w-4'
                />
              </DropdownMenu>
            </div>
          )}

          {chat.last_message && (
            <>
              {chat.last_message.unread && (
                <div
                  className='size-2 rounded-full bg-secondary-500'
                  data-testid='chat-unread-indicator'
                />
              )}

              <RelativeTimestamp
                timestamp={chat.last_message.created_at}
                align='right'
                size='xs'
                theme={chat.last_message.unread ? 'default' : 'muted'}
                truncate
              />
            </>
          )}
        </HStack>
      </HStack>
    </div>
  );
};

export { ChatListItem as default };
