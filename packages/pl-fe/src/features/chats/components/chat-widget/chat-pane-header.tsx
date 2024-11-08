import React, { HTMLAttributes } from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Text from 'pl-fe/components/ui/text';
import { useSettings } from 'pl-fe/hooks/use-settings';

interface IChatPaneHeader {
  isOpen: boolean;
  isToggleable?: boolean;
  onToggle(): void;
  title: string | React.ReactNode;
  unreadCount?: number;
  secondaryAction?(): void;
  secondaryActionIcon?: string;
}

const ChatPaneHeader = (props: IChatPaneHeader) => {
  const {
    isOpen,
    isToggleable = true,
    onToggle,
    secondaryAction,
    secondaryActionIcon,
    title,
    unreadCount,
    ...rest
  } = props;

  const { demetricator } = useSettings();

  const ButtonComp = isToggleable ? 'button' : 'div';
  const buttonProps: HTMLAttributes<HTMLButtonElement | HTMLDivElement> = {};
  if (isToggleable) {
    buttonProps.onClick = onToggle;
  }

  return (
    <HStack {...rest} alignItems='center' justifyContent='between' className='h-16 rounded-t-xl px-4 py-3'>
      <ButtonComp
        className='flex h-16 grow flex-row items-center space-x-1'
        data-testid='title'
        {...buttonProps}
      >
        <Text weight='semibold' tag='div'>
          {title}
        </Text>

        {(!demetricator && typeof unreadCount !== 'undefined' && unreadCount > 0) && (
          <HStack alignItems='center' space={2}>
            <Text weight='semibold' data-testid='unread-count'>
              ({unreadCount})
            </Text>

            <div className='size-2.5 rounded-full bg-accent-300' />
          </HStack>
        )}
      </ButtonComp>

      <HStack space={2} alignItems='center'>
        {secondaryAction ? (
          <IconButton
            onClick={secondaryAction}
            src={secondaryActionIcon as string}
            iconClassName='h-5 w-5 text-gray-600'
          />
        ) : null}

        <IconButton
          onClick={onToggle}
          src={isOpen ? require('@tabler/icons/outline/chevron-down.svg') : require('@tabler/icons/outline/chevron-up.svg')}
          iconClassName='h-5 w-5 text-gray-600'
        />
      </HStack>
    </HStack>
  );
};

export { ChatPaneHeader as default };
