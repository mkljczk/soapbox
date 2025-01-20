import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import List, { ListItem } from 'pl-fe/components/list';
import Column from 'pl-fe/components/ui/column';
import Emoji from 'pl-fe/components/ui/emoji';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { bookmarkFoldersQueryOptions } from 'pl-fe/queries/statuses/bookmark-folders';

import NewFolderForm from './components/new-folder-form';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
});

const BookmarkFolders: React.FC = () => {
  const intl = useIntl();
  const features = useFeatures();

  const { data: bookmarkFolders, isFetching } = useQuery(bookmarkFoldersQueryOptions);

  if (!features.bookmarkFolders) return <Redirect to='/bookmarks/all' />;

  if (isFetching) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <NewFolderForm />

        <List>
          <ListItem
            to='/bookmarks/all'
            label={
              <HStack alignItems='center' space={2}>
                <Icon src={require('@tabler/icons/outline/bookmarks.svg')} size={20} />
                <span><FormattedMessage id='bookmark_folders.all_bookmarks' defaultMessage='All bookmarks' /></span>
              </HStack>
            }
          />
          {bookmarkFolders?.map((folder) => (
            <ListItem
              key={folder.id}
              to={`/bookmarks/${folder.id}`}
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
            />
          ))}
        </List>
      </Stack>
    </Column>
  );
};

export { BookmarkFolders as default };
