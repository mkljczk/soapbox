import { useFloating, shift, autoUpdate } from '@floating-ui/react';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useBookmarkFolder } from 'pl-fe/api/hooks/statuses/use-bookmark-folder';
import { useUpdateBookmarkFolder } from 'pl-fe/api/hooks/statuses/use-update-bookmark-folder';
import Emoji from 'pl-fe/components/ui/emoji';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Input from 'pl-fe/components/ui/input';
import Modal from 'pl-fe/components/ui/modal';
import EmojiPickerDropdown from 'pl-fe/features/emoji/components/emoji-picker-dropdown';
import { messages as emojiMessages } from 'pl-fe/features/emoji/containers/emoji-picker-dropdown-container';
import { useTextField } from 'pl-fe/hooks/forms/use-text-field';
import { useClickOutside } from 'pl-fe/hooks/use-click-outside';
import toast from 'pl-fe/toast';

import type { BaseModalProps } from '../modal-root';
import type { Emoji as EmojiType } from 'pl-fe/features/emoji';

const messages = defineMessages({
  label: { id: 'bookmark_folders.new.title_placeholder', defaultMessage: 'New folder title' },
  editSuccess: { id: 'bookmark_folders.edit.success', defaultMessage: 'Bookmark folder edited successfully' },
  editFail: { id: 'bookmark_folders.edit.fail', defaultMessage: 'Failed to edit bookmark folder' },
});

interface IEmojiPicker {
  emoji?: string;
  emojiUrl?: string;
  onPickEmoji?: (emoji: EmojiType) => void;
}

const EmojiPicker: React.FC<IEmojiPicker> = ({ emoji, emojiUrl, ...props }) => {
  const intl = useIntl();
  const title = intl.formatMessage(emojiMessages.emoji);
  const [visible, setVisible] = useState(false);

  const { x, y, strategy, refs, update } = useFloating<HTMLButtonElement>({
    middleware: [shift()],
    whileElementsMounted: autoUpdate,
  });

  useClickOutside(refs, () => {
    setVisible(false);
  });

  const handleToggle: React.KeyboardEventHandler<HTMLButtonElement> & React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setVisible(!visible);
  };

  return (
    <div className='relative'>
      <button
        className='mt-1 flex size-[38px] items-center justify-center rounded-md border border-solid border-gray-400 bg-white text-gray-900 ring-1 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800 dark:focus:border-primary-500 dark:focus:ring-primary-500'
        ref={refs.setReference}
        title={title}
        aria-label={title}
        aria-expanded={visible}
        onClick={handleToggle}
        onKeyDown={handleToggle}
        tabIndex={0}
      >
        {emoji
          ? <Emoji className='size-5' emoji={emoji} src={emojiUrl} />
          : <Icon className='size-5 fill-gray-600 hover:fill-gray-700 dark:hover:fill-gray-500' src={require('@fluentui/emoji_hint_24_regular.svg')} />}
      </button>

      {createPortal(
        <div
          className='z-[101]'
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
        >
          <EmojiPickerDropdown
            visible={visible}
            setVisible={setVisible}
            update={update}
            {...props}
          />
        </div>,
        document.body,
      )}
    </div>
  );
};

interface EditBookmarkFolderModalProps {
  folderId: string;
}

const EditBookmarkFolderModal: React.FC<BaseModalProps & EditBookmarkFolderModalProps> = ({ folderId, onClose }) => {
  const intl = useIntl();

  const { bookmarkFolder } = useBookmarkFolder(folderId);
  const { updateBookmarkFolder, isSubmitting } = useUpdateBookmarkFolder(folderId);

  const [emoji, setEmoji] = useState(bookmarkFolder?.emoji || undefined);
  const [emojiUrl, setEmojiUrl] = useState(bookmarkFolder?.emoji_url || undefined);
  const name = useTextField(bookmarkFolder?.name);

  const handleEmojiPick = (data: EmojiType) => {
    if (data.custom) {
      setEmojiUrl(data.imageUrl);
      setEmoji(data.colons);
    } else {
      setEmoji(data.native);
    }
  };

  const onClickClose = () => {
    onClose('EDIT_BOOKMARK_FOLDER');
  };

  const handleSubmit = () => {
    updateBookmarkFolder({
      name: name.value,
      emoji,
    }, {
      onSuccess() {
        toast.success(intl.formatMessage(messages.editSuccess));
        onClose('EDIT_BOOKMARK_FOLDER');
      },
      onError() {
        toast.success(intl.formatMessage(messages.editFail));
      },
    });
  };

  const label = intl.formatMessage(messages.label);

  return (
    <Modal
      title={<FormattedMessage id='edit_bookmark_folder_modal.header_title' defaultMessage='Edit folder' />}
      onClose={onClickClose}
      confirmationAction={handleSubmit}
      confirmationText={<FormattedMessage id='edit_bookmark_folder_modal.confirm' defaultMessage='Save' />}
    >
      <HStack space={2}>
        <EmojiPicker
          emoji={emoji}
          emojiUrl={emojiUrl}
          onPickEmoji={handleEmojiPick}
        />
        <label className='grow'>
          <span style={{ display: 'none' }}>{label}</span>

          <Input
            type='text'
            placeholder={label}
            disabled={isSubmitting}
            {...name}
          />
        </label>
      </HStack>
    </Modal>
  );
};

export { EditBookmarkFolderModal as default, type EditBookmarkFolderModalProps };
