import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchAccountTimeline } from 'pl-fe/actions/timelines';
import Spinner from 'pl-fe/components/ui/spinner';
import Text from 'pl-fe/components/ui/text';
import Widget from 'pl-fe/components/ui/widget';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { type AccountGalleryAttachment, getAccountGallery } from 'pl-fe/selectors';
import { useModalsStore } from 'pl-fe/stores/modals';

import MediaItem from '../../../account-gallery/components/media-item';

import type { Account } from 'pl-fe/normalizers/account';

interface IProfileMediaPanel {
  account?: Account;
}

const ProfileMediaPanel: React.FC<IProfileMediaPanel> = ({ account }) => {
  const dispatch = useAppDispatch();
  const { openModal } = useModalsStore();

  const [loading, setLoading] = useState(true);

  const attachments: Array<AccountGalleryAttachment> = useAppSelector((state) => account ? getAccountGallery(state, account?.id) : []);

  const handleOpenMedia = (attachment: AccountGalleryAttachment): void => {
    if (attachment.type === 'video') {
      openModal('VIDEO', { media: attachment, statusId: attachment.status.id });
    } else {
      const media = attachment.status.media_attachments;
      const index = media.findIndex(x => x.id === attachment.id);

      openModal('MEDIA', { media, index, statusId: attachment.status.id });
    }
  };

  useEffect(() => {
    setLoading(true);

    if (account) {
      dispatch(fetchAccountTimeline(account.id, { only_media: true, limit: 40 }))
        // @ts-ignore yes it does
        .then(() => setLoading(false))
        .catch(() => {});
    }
  }, [account?.id]);

  const renderAttachments = () => {
    const publicAttachments = attachments.filter(attachment => attachment.status.visibility === 'public');
    const nineAttachments = publicAttachments.slice(0, 9);

    if (nineAttachments.length) {
      return (
        <div className='grid grid-cols-3 gap-0.5 overflow-hidden rounded-md'>
          {nineAttachments.map((attachment, index) => (
            <MediaItem
              key={`${attachment.status.id}+${attachment.id}`}
              attachment={attachment}
              onOpenMedia={handleOpenMedia}
              isLast={index === nineAttachments.length - 1}
            />
          ))}
        </div>
      );
    } else {
      return (
        <Text size='sm' theme='muted'>
          <FormattedMessage id='media_panel.empty_message' defaultMessage='No media found.' />
        </Text>
      );
    }
  };

  return (
    <Widget title={<FormattedMessage id='media_panel.title' defaultMessage='Media' />}>
      {account && (
        <div className='w-full'>
          {loading ? (
            <Spinner />
          ) : (
            renderAttachments()
          )}
        </div>
      )}
    </Widget>
  );
};

export { ProfileMediaPanel as default };
