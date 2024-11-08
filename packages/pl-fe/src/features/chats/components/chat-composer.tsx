import React, { useState } from 'react';
import { defineMessages, IntlShape, useIntl } from 'react-intl';

import { unblockAccount } from 'pl-fe/actions/accounts';
import { useRelationship } from 'pl-fe/api/hooks/accounts/use-relationship';
import Button from 'pl-fe/components/ui/button';
import Combobox, { ComboboxInput, ComboboxList, ComboboxOption, ComboboxPopover } from 'pl-fe/components/ui/combobox';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useChatContext } from 'pl-fe/contexts/chat-context';
import UploadButton from 'pl-fe/features/compose/components/upload-button';
import emojiSearch from 'pl-fe/features/emoji/search';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useModalsStore } from 'pl-fe/stores/modals';
import { textAtCursorMatchesToken } from 'pl-fe/utils/suggestions';

import ChatTextarea from './chat-textarea';

import type { MediaAttachment } from 'pl-api';
import type { Emoji, NativeEmoji } from 'pl-fe/features/emoji';

const messages = defineMessages({
  placeholder: { id: 'chat.input.placeholder', defaultMessage: 'Type a message' },
  send: { id: 'chat.actions.send', defaultMessage: 'Send' },
  retry: { id: 'chat.retry', defaultMessage: 'Retry?' },
  blocked: { id: 'chat_message_list.blocked', defaultMessage: 'You blocked this user' },
  unblock: { id: 'chat_composer.unblock', defaultMessage: 'Unblock' },
  unblockMessage: { id: 'chat_settings.unblock.message', defaultMessage: 'Unblocking will allow this profile to direct message you and view your content.' },
  unblockHeading: { id: 'chat_settings.unblock.heading', defaultMessage: 'Unblock @{acct}' },
  unblockConfirm: { id: 'chat_settings.unblock.confirm', defaultMessage: 'Unblock' },
});

const initialSuggestionState = {
  list: [],
  tokenStart: 0,
  token: '',
};

interface Suggestion {
  list: Emoji[];
  tokenStart: number;
  token: string;
}

interface IChatComposer extends Pick<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onKeyDown' | 'onChange' | 'onPaste' | 'disabled'> {
  value: string;
  onSubmit: () => void;
  errorMessage: string | undefined;
  onSelectFile: (files: FileList, intl: IntlShape) => void;
  resetFileKey: number | null;
  resetContentKey: number | null;
  attachment?: MediaAttachment | null;
  onDeleteAttachment?: () => void;
  uploading?: boolean;
  uploadProgress?: number;
}

/** Textarea input for chats. */
const ChatComposer = React.forwardRef<HTMLTextAreaElement | null, IChatComposer>(({
  onKeyDown,
  onChange,
  value,
  onSubmit,
  errorMessage = false,
  disabled = false,
  onSelectFile,
  resetFileKey,
  resetContentKey,
  onPaste,
  attachment,
  onDeleteAttachment,
  uploading,
  uploadProgress,
}, ref) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { openModal } = useModalsStore();
  const { chat } = useChatContext();
  const { relationship } = useRelationship(chat?.account.id, { enabled: !!chat });

  const isBlocked = relationship?.blocked_by && false;
  const isBlocking = relationship?.blocking && false;

  const maxCharacterCount = useInstance().configuration.chats.max_characters;

  const [suggestions, setSuggestions] = useState<Suggestion>(initialSuggestionState);
  const isSuggestionsAvailable = suggestions.list.length > 0;

  const isOverCharacterLimit = maxCharacterCount && value?.length > maxCharacterCount;
  const isSubmitDisabled = disabled || uploading || isOverCharacterLimit || (value.length === 0 && !attachment);

  const overLimitText = maxCharacterCount ? maxCharacterCount - value?.length : '';

  const renderSuggestionValue = (emoji: any) =>
    `${(value).slice(0, suggestions.tokenStart)}${emoji.native} ${(value as string).slice(suggestions.tokenStart + suggestions.token.length)}`;

  const onSelectComboboxOption = (selection: string) => {
    const event = { target: { value: selection } } as React.ChangeEvent<HTMLTextAreaElement>;

    if (onChange) {
      onChange(event);
      setSuggestions(initialSuggestionState);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const [tokenStart, token] = textAtCursorMatchesToken(
      event.target.value,
      event.target.selectionStart,
      [':'],
    );

    if (token && tokenStart) {
      const results = emojiSearch(token.replace(':', ''), { maxResults: 5 });
      setSuggestions({
        list: results,
        token,
        tokenStart: tokenStart - 1,
      });
    } else {
      setSuggestions(initialSuggestionState);
    }

    if (onChange) {
      onChange(event);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && isSuggestionsAvailable) {
      return;
    }

    if (onKeyDown) {
      onKeyDown(event);
    }
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

  if (isBlocking) {
    return (
      <div className='mt-auto p-6 shadow-3xl dark:border-t-2 dark:border-solid dark:border-gray-800'>
        <Stack space={3} alignItems='center'>
          <Text align='center' theme='muted'>
            {intl.formatMessage(messages.blocked)}
          </Text>

          <Button theme='secondary' onClick={handleUnblockUser}>
            {intl.formatMessage(messages.unblock)}
          </Button>
        </Stack>
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  return (
    <div className='mt-auto px-4 shadow-3xl'>
      {/* Spacer */}
      <div className='h-5' />

      <HStack alignItems='stretch' justifyContent='between' space={4}>
        <Stack justifyContent='end' alignItems='center' className='mb-1.5 w-10'>
          <UploadButton
            onSelectFile={onSelectFile}
            resetFileKey={resetFileKey}
            iconClassName='h-5 w-5'
            className='text-primary-500'
            disabled={uploading || !!attachment}
          />
        </Stack>

        <Stack grow>
          <Combobox onSelect={onSelectComboboxOption}>
            <ComboboxInput
              key={resetContentKey}
              as={ChatTextarea}
              autoFocus
              ref={ref}
              placeholder={intl.formatMessage(messages.placeholder)}
              onKeyDown={handleKeyDown}
              value={value}
              onChange={handleChange}
              onPaste={onPaste}
              isResizeable={false}
              autoGrow
              maxRows={5}
              disabled={disabled}
              attachment={attachment}
              onDeleteAttachment={onDeleteAttachment}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
            {isSuggestionsAvailable ? (
              <ComboboxPopover>
                <ComboboxList>
                  {suggestions.list.map((emojiSuggestion) => (
                    <ComboboxOption
                      key={emojiSuggestion.colons}
                      value={renderSuggestionValue(emojiSuggestion)}
                    >
                      <span>{(emojiSuggestion as NativeEmoji).native}</span>
                      <span className='ml-1'>
                        {emojiSuggestion.colons}
                      </span>
                    </ComboboxOption>
                  ))}
                </ComboboxList>
              </ComboboxPopover>
            ) : null}
          </Combobox>
        </Stack>

        <Stack space={2} justifyContent='end' alignItems='center' className='mb-1.5 w-10'>
          {isOverCharacterLimit ? (
            <Text size='sm' theme='danger'>{overLimitText}</Text>
          ) : null}

          <IconButton
            src={require('@fluentui/send_24_regular.svg')}
            iconClassName='h-5 w-5'
            className='text-primary-500'
            disabled={isSubmitDisabled}
            onClick={onSubmit}
          />
        </Stack>
      </HStack>

      <HStack alignItems='center' className='h-5' space={1}>
        {errorMessage && (
          <>
            <Text theme='danger' size='xs'>
              {errorMessage}
            </Text>

            <button onClick={onSubmit} className='flex hover:underline'>
              <Text theme='primary' size='xs' tag='span'>
                {intl.formatMessage(messages.retry)}
              </Text>
            </button>
          </>
        )}
      </HStack>
    </div>
  );
});

export { ChatComposer as default };
