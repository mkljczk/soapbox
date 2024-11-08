import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { fetchAccountTimeline } from 'pl-fe/actions/timelines';
import { useAccountLookup } from 'pl-fe/api/hooks/accounts/use-account-lookup';
import LoadMore from 'pl-fe/components/load-more';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { type AccountGalleryAttachment, getAccountGallery } from 'pl-fe/selectors';
import { useModalsStore } from 'pl-fe/stores/modals';

import MediaItem from './components/media-item';

const AccountGallery = () => {
  const dispatch = useAppDispatch();
  const { username } = useParams<{ username: string }>();
  const { openModal } = useModalsStore();

  const {
    account,
    isLoading: accountLoading,
    isUnavailable,
  } = useAccountLookup(username, { withRelationship: true });

  const attachments: Array<AccountGalleryAttachment> = useAppSelector((state) => account ? getAccountGallery(state, account.id) : []);
  const isLoading = useAppSelector((state) => state.timelines.get(`account:${account?.id}:with_replies:media`)?.isLoading);
  const hasMore = useAppSelector((state) => state.timelines.get(`account:${account?.id}:with_replies:media`)?.hasMore);

  const handleScrollToBottom = () => {
    if (hasMore) {
      handleLoadMore();
    }
  };

  const handleLoadMore = () => {
    if (account) {
      dispatch(fetchAccountTimeline(account.id, { only_media: true }, true));
    }
  };

  const handleLoadOlder: React.MouseEventHandler = e => {
    e.preventDefault();
    handleScrollToBottom();
  };

  const handleOpenMedia = (attachment: AccountGalleryAttachment) => {
    if (attachment.type === 'video') {
      openModal('VIDEO', { media: attachment, statusId: attachment.status.id });
    } else {
      const media = attachment.status.media_attachments;
      const index = media.findIndex((x) => x.id === attachment.id);

      openModal('MEDIA', { media, index, statusId: attachment.status.id });
    }
  };

  useEffect(() => {
    if (account) {
      dispatch(fetchAccountTimeline(account.id, { only_media: true, limit: 40 }));
    }
  }, [account?.id]);

  if (accountLoading || (!attachments && isLoading)) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  if (!account) {
    return (
      <MissingIndicator />
    );
  }

  let loadOlder = null;

  if (hasMore && !(isLoading && attachments.length === 0)) {
    loadOlder = <LoadMore className='my-auto mt-4' visible={!isLoading} onClick={handleLoadOlder} />;
  }

  if (isUnavailable) {
    return (
      <Column>
        <div className='empty-column-indicator'>
          <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' />
        </div>
      </Column>
    );
  }

  return (
    <Column label={`@${account.acct}`} transparent withHeader={false}>
      <div role='feed' className='grid grid-cols-2 gap-1 overflow-hidden rounded-md sm:grid-cols-3'>
        {attachments.map((attachment, index) => (
          <MediaItem
            key={`${attachment.status.id}+${attachment.id}`}
            attachment={attachment}
            onOpenMedia={handleOpenMedia}
            isLast={index === attachments.length - 1}
          />
        ))}

        {!isLoading && attachments.length === 0 && (
          <div className='empty-column-indicator col-span-2 sm:col-span-3'>
            <FormattedMessage id='account_gallery.none' defaultMessage='No media to show.' />
          </div>
        )}
      </div>

      {loadOlder}

      {isLoading && attachments.length === 0 && (
        <div className='relative flex-auto px-8 py-4'>
          <Spinner />
        </div>
      )}
    </Column>
  );
};

export { AccountGallery as default };
