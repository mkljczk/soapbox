import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { RadioGroup, RadioItem } from 'pl-fe/components/radio';
import Emoji from 'pl-fe/components/ui/emoji';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import NewFolderForm from 'pl-fe/features/bookmark-folders/components/new-folder-form';
import { bookmarkFoldersQueryOptions } from 'pl-fe/queries/statuses/bookmark-folders';
import { statusQueryOptions } from 'pl-fe/queries/statuses/status';
import { bookmarkStatusMutationOptions } from 'pl-fe/queries/statuses/status-interactions';

import type { BaseModalProps } from '../modal-root';

interface SelectBookmarkFolderModalProps {
  statusId: string;
}

const SelectBookmarkFolderModal: React.FC<SelectBookmarkFolderModalProps & BaseModalProps> = ({ statusId, onClose }) => {
  const { data: status } = useQuery(statusQueryOptions(statusId));
  const { isFetching, data: bookmarkFolders } = useQuery(bookmarkFoldersQueryOptions);
  const { mutate: bookmarkStatus } = useMutation(bookmarkStatusMutationOptions);

  const [selectedFolder, setSelectedFolder] = useState(status!.bookmark_folder);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const folderId = e.target.value;
    setSelectedFolder(folderId);

    bookmarkStatus({ statusId, folderId }, {
      onSuccess: () => {
        onClose('SELECT_BOOKMARK_FOLDER');
      },
    });
  };

  const onClickClose = () => {
    onClose('SELECT_BOOKMARK_FOLDER');
  };

  const items = [
    <RadioItem
      key='all'
      label={
        <HStack alignItems='center' space={2}>
          <Icon src={require('@tabler/icons/outline/bookmarks.svg')} size={20} />
          <span><FormattedMessage id='bookmark_folders.all_bookmarks' defaultMessage='All bookmarks' /></span>
        </HStack>
      }
      checked={selectedFolder === null}
      value=''
    />,
  ];

  if (!isFetching) {
    items.push(...((bookmarkFolders || []).map((folder) => (
      <RadioItem
        key={folder.id}
        label={
          <HStack alignItems='center' space={2}>
            {folder.emoji ? (
              <Emoji
                emoji={folder.emoji}
                src={folder.emoji_url || undefined}
                className='size-5 flex-none'
              />
            ) : <Icon src={require('@tabler/icons/outline/folder.svg')} size={20} />}
            <span>{folder.name}</span>
          </HStack>
        }
        checked={selectedFolder === folder.id}
        value={folder.id}
      />
    ))));
  }

  const body = isFetching ? <Spinner /> : (
    <Stack space={4}>
      <NewFolderForm />

      <RadioGroup onChange={onChange}>
        {items}
      </RadioGroup>
    </Stack>
  );

  return (
    <Modal
      title={<FormattedMessage id='select_bookmark_folder_modal.header_title' defaultMessage='Select folder' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { type SelectBookmarkFolderModalProps, SelectBookmarkFolderModal as default };
