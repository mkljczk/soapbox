import clsx from 'clsx';
import React, { MutableRefObject, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { uploadMedia } from 'pl-fe/actions/media';
import Stack from 'pl-fe/components/ui/stack';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useChatActions } from 'pl-fe/queries/chats';
import toast from 'pl-fe/toast';

import ChatComposer from './chat-composer';
import ChatMessageList from './chat-message-list';

import type { Chat as ChatEntity, MediaAttachment } from 'pl-api';
import type { PlfeResponse } from 'pl-fe/api';

const fileKeyGen = (): number => Math.floor((Math.random() * 0x10000));

const messages = defineMessages({
  failedToSend: { id: 'chat.failed_to_send', defaultMessage: 'Message failed to send.' },
  uploadErrorLimit: { id: 'upload_error.limit', defaultMessage: 'File upload limit exceeded.' },
});

interface ChatInterface {
  chat: ChatEntity;
  inputRef?: MutableRefObject<HTMLTextAreaElement | null>;
  className?: string;
}

/**
 * Clears the value of the input while dispatching the `onChange` function
 * which allows the <Textarea> to resize itself (this is important)
 * because we autoGrow the element as the user inputs text that spans
 * beyond one line
 */
const clearNativeInputValue = (element: HTMLTextAreaElement) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, '');

    const ev2 = new Event('input', { bubbles: true });
    element.dispatchEvent(ev2);
  }
};

/**
 * Chat UI with just the messages and textarea.
 * Reused between floating desktop chats and fullscreen/mobile chats.
 */
const Chat: React.FC<ChatInterface> = ({ chat, inputRef, className }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { createChatMessage } = useChatActions(chat.id);

  const [content, setContent] = useState<string>('');
  const [attachment, setAttachment] = useState<MediaAttachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resetContentKey, setResetContentKey] = useState<number>(fileKeyGen());
  const [resetFileKey, setResetFileKey] = useState<number>(fileKeyGen());
  const [errorMessage, setErrorMessage] = useState<string>();

  const isSubmitDisabled = content.length === 0 && !attachment;

  const submitMessage = () => {
    createChatMessage.mutate({ chatId: chat.id, content, mediaId: attachment?.id }, {
      onSuccess: () => {
        setErrorMessage(undefined);
      },
      onError: (error: { response: PlfeResponse }, _variables, context) => {
        const message = error.response?.json?.error;
        setErrorMessage(message || intl.formatMessage(messages.failedToSend));
        setContent(context.prevContent as string);
      },
    });

    clearState();
  };

  const clearState = () => {
    if (inputRef?.current) {
      clearNativeInputValue(inputRef.current);
    }
    setContent('');
    setAttachment(null);
    setUploading(false);
    setUploadProgress(0);
    setResetFileKey(fileKeyGen());
    setResetContentKey(fileKeyGen());
  };

  const sendMessage = () => {
    if (!isSubmitDisabled && !createChatMessage.isPending) {
      submitMessage();
    }
  };

  const insertLine = () => setContent(content + '\n');

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    markRead();

    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      insertLine();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleContentChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setContent(event.target.value);
  };

  const handlePaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (isSubmitDisabled && e.clipboardData && e.clipboardData.files.length === 1) {
      handleFiles(e.clipboardData.files);
    }
  };

  const markRead = () => {
    // markAsRead.mutate();
    // dispatch(markChatRead(chatId));
  };

  const handleMouseOver = () => markRead();

  const handleRemoveFile = () => {
    setAttachment(null);
    setResetFileKey(fileKeyGen());
  };

  const onUploadProgress = (e: ProgressEvent) => {
    const { loaded, total } = e;
    setUploadProgress(loaded / total);
  };

  const handleFiles = (files: FileList) => {
    if (attachment) {
      toast.error(messages.uploadErrorLimit);
      return;
    }

    setUploading(true);

    dispatch(uploadMedia({ file: files[0] }, onUploadProgress)).then(response => {
      setAttachment(response);
      setUploading(false);
    })
      .catch(() => setUploading(false));
  };

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, [chat.id, inputRef?.current]);

  return (
    <Stack className={clsx('flex grow overflow-hidden', className)} onMouseOver={handleMouseOver}>
      <div className='flex h-full grow justify-center overflow-hidden'>
        <ChatMessageList key={chat.id} chat={chat} />
      </div>

      <ChatComposer
        ref={inputRef}
        onKeyDown={handleKeyDown}
        value={content}
        onChange={handleContentChange}
        onSubmit={sendMessage}
        errorMessage={errorMessage}
        onSelectFile={handleFiles}
        resetFileKey={resetFileKey}
        resetContentKey={resetContentKey}
        onPaste={handlePaste}
        attachment={attachment}
        onDeleteAttachment={handleRemoveFile}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />
    </Stack>
  );
};

export { Chat as default };
