import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchGroupTimeline } from 'pl-fe/actions/timelines';
import Spinner from 'pl-fe/components/ui/spinner';
import Text from 'pl-fe/components/ui/text';
import Widget from 'pl-fe/components/ui/widget';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { type AccountGalleryAttachment, getGroupGallery } from 'pl-fe/selectors';
import { useModalsStore } from 'pl-fe/stores/modals';

import MediaItem from '../../../account-gallery/components/media-item';

import type { Group } from 'pl-fe/normalizers/group';

interface IGroupMediaPanel {
  group?: Group;
}

const GroupMediaPanel: React.FC<IGroupMediaPanel> = ({ group }) => {
  const dispatch = useAppDispatch();
  const { openModal } = useModalsStore();

  const [loading, setLoading] = useState(true);

  const isMember = !!group?.relationship?.member;
  const isPrivate = group?.locked;

  const attachments: Array<AccountGalleryAttachment> = useAppSelector((state) => group ? getGroupGallery(state, group?.id) : []);

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

    if (group && (isMember || !isPrivate)) {
      dispatch(fetchGroupTimeline(group.id, { only_media: true, limit: 40 }))
      // @ts-ignore
        .then(() => setLoading(false))
        .catch(() => {});
    }
  }, [group?.id, isMember, isPrivate]);

  const renderAttachments = () => {
    const nineAttachments = attachments.slice(0, 9);

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

  if (isPrivate && !isMember) {
    return null;
  }

  return (
    <Widget title={<FormattedMessage id='media_panel.title' defaultMessage='Media' />}>
      {group && (
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

export { GroupMediaPanel as default };
