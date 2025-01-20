import debounce from 'lodash/debounce';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchBookmarkedStatuses, expandBookmarkedStatuses } from 'pl-fe/actions/bookmarks';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import StatusList from 'pl-fe/components/status-list';
import Column from 'pl-fe/components/ui/column';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useIsMobile } from 'pl-fe/hooks/use-is-mobile';
import { useTheme } from 'pl-fe/hooks/use-theme';
import { useBookmarkFolder, useDeleteBookmarkFolder } from 'pl-fe/queries/statuses/use-bookmark-folders';
import { useModalsStore } from 'pl-fe/stores/modals';
import toast from 'pl-fe/toast';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  editFolder: { id: 'bookmarks.edit_folder', defaultMessage: 'Edit folder' },
  deleteFolder: { id: 'bookmarks.delete_folder', defaultMessage: 'Delete folder' },
  deleteFolderHeading: { id: 'confirmations.delete_bookmark_folder.heading', defaultMessage: 'Delete "{name}" folder?' },
  deleteFolderMessage: { id: 'confirmations.delete_bookmark_folder.message', defaultMessage: 'Are you sure you want to delete the folder? The bookmarks will still be stored.' },
  deleteFolderConfirm: { id: 'confirmations.delete_bookmark_folder.confirm', defaultMessage: 'Delete folder' },
  deleteFolderSuccess: { id: 'bookmarks.delete_folder.success', defaultMessage: 'Folder deleted' },
  deleteFolderFail: { id: 'bookmarks.delete_folder.fail', defaultMessage: 'Failed to delete folder' },
});

const handleLoadMore = debounce((dispatch, folderId) => {
  dispatch(expandBookmarkedStatuses(folderId));
}, 300, { leading: true });

interface IBookmarks {
  params?: {
    id?: string;
  };
}

const Bookmarks: React.FC<IBookmarks> = ({ params }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const folderId = params?.id;

  const { openModal } = useModalsStore();
  const { data: folder } = useBookmarkFolder(folderId);
  const { mutate: deleteBookmarkFolder } = useDeleteBookmarkFolder();

  const bookmarksKey = folderId ? `bookmarks:${folderId}` : 'bookmarks';

  const statusIds = useAppSelector((state) => state.status_lists[bookmarksKey]?.items || []);
  const isLoading = useAppSelector((state) => state.status_lists[bookmarksKey]?.isLoading === true);
  const hasMore = useAppSelector((state) => !!state.status_lists[bookmarksKey]?.next);

  React.useEffect(() => {
    dispatch(fetchBookmarkedStatuses(folderId));
  }, [folderId]);

  const handleRefresh = () => dispatch(fetchBookmarkedStatuses(folderId));

  const handleEditFolder = () => {
    if (!folderId) return;
    openModal('EDIT_BOOKMARK_FOLDER', { folderId });
  };

  const handleDeleteFolder = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteFolderHeading, { name: folder?.name }),
      message: intl.formatMessage(messages.deleteFolderMessage),
      confirm: intl.formatMessage(messages.deleteFolderConfirm),
      onConfirm: () => {
        deleteBookmarkFolder(folderId!, {
          onSuccess() {
            toast.success(messages.deleteFolderSuccess);
            history.push('/bookmarks');
          },
          onError() {
            toast.error(messages.deleteFolderFail);
          },
        });
      },
    });
  };

  const emptyMessage = folderId
    ? <FormattedMessage id='empty_column.bookmarks.folder' defaultMessage="You don't have any bookmarks in this folder yet. When you add one, it will show up here." />
    : <FormattedMessage id='empty_column.bookmarks' defaultMessage="You don't have any bookmarks yet. When you add one, it will show up here." />;

  const items = folderId ? [
    {
      text: intl.formatMessage(messages.editFolder),
      action: handleEditFolder,
      icon: require('@tabler/icons/outline/edit.svg'),
    },
    {
      text: intl.formatMessage(messages.deleteFolder),
      action: handleDeleteFolder,
      icon: require('@tabler/icons/outline/trash.svg'),
    },
  ] : [];

  return (
    <Column
      label={folder ? folder.name : intl.formatMessage(messages.heading)}
      action={<DropdownMenu items={items} src={require('@tabler/icons/outline/dots-vertical.svg')} />}
      transparent={!isMobile}
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <StatusList
          className='black:p-0 black:sm:p-4 black:sm:pt-0'
          loadMoreClassName='black:sm:mx-4'
          statusIds={statusIds}
          scrollKey='bookmarked_statuses'
          hasMore={hasMore}
          isLoading={typeof isLoading === 'boolean' ? isLoading : true}
          onLoadMore={() => handleLoadMore(dispatch, folderId)}
          emptyMessage={emptyMessage}
          divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
        />
      </PullToRefresh>
    </Column>
  );
};

export { Bookmarks as default };
