import clsx from 'clsx';
import React from 'react';

import Blurhash from 'pl-fe/components/blurhash';
import Icon from 'pl-fe/components/ui/icon';
import { useModalsStore } from 'pl-fe/stores/modals';

import ChatUploadPreview from './chat-upload-preview';

import type { MediaAttachment } from 'pl-api';

interface IChatUpload {
  attachment: MediaAttachment;
  onDelete?(): void;
}

/** An attachment uploaded to the chat composer, before sending. */
const ChatUpload: React.FC<IChatUpload> = ({ attachment, onDelete }) => {
  const { openModal } = useModalsStore();
  const clickable = attachment.type !== 'unknown';

  const handleOpenModal = () => {
    openModal('MEDIA', { media: [attachment], index: 0 });
  };

  return (
    <div className='relative isolate inline-block size-24 overflow-hidden rounded-lg bg-gray-200 dark:bg-primary-900'>
      <Blurhash hash={attachment.blurhash} className='absolute inset-0 -z-10 size-full' />

      <div className='absolute right-[6px] top-[6px]'>
        <RemoveButton onClick={onDelete} />
      </div>

      <button
        onClick={clickable ? handleOpenModal : undefined}
        className={clsx('size-full', { 'cursor-zoom-in': clickable, 'cursor-default': !clickable })}
      >
        <ChatUploadPreview attachment={attachment} />
      </button>
    </div>
  );
};

interface IRemoveButton {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/** Floating button to remove an attachment. */
const RemoveButton: React.FC<IRemoveButton> = ({ onClick }) => (
  <button
    type='button'
    onClick={onClick}
    className='flex size-5 items-center justify-center rounded-full bg-secondary-500 p-1'
  >
    <Icon
      className='size-3 text-white'
      src={require('@fluentui/dismiss_24_regular.svg')}
    />
  </button>
);

export { ChatUpload as default };
