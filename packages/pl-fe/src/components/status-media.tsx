import React, { Suspense } from 'react';

import AttachmentThumbs from 'pl-fe/components/attachment-thumbs';
import PreviewCard from 'pl-fe/components/preview-card';
import PlaceholderCard from 'pl-fe/features/placeholder/components/placeholder-card';
import { MediaGallery, Video, Audio } from 'pl-fe/features/ui/util/async-components';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { useModalsStore } from 'pl-fe/stores/modals';

import { isMediaVisible } from './statuses/sensitive-content-overlay';

import type { MediaAttachment } from 'pl-api';
import type { UseStatusData as Status } from 'pl-hooks';

interface IStatusMedia {
  /** Status entity to render media for. */
  status: Pick<Status, 'id' | 'account' | 'card' | 'expectsCard' /* | 'hidden' */ | 'media_attachments' | 'quote_id' | 'sensitive' | 'spoiler_text' | 'visibility'>;
  /** Whether to display compact media. */
  muted?: boolean;
  /** Callback when compact media is clicked. */
  onClick?: () => void;
}

/** Render media attachments for a status. */
const StatusMedia: React.FC<IStatusMedia> = ({
  status,
  muted = false,
  onClick,
}) => {
  const { openModal } = useModalsStore();
  const { displayMedia } = useSettings();

  const visible = isMediaVisible(status, displayMedia);

  const size = status.media_attachments.length;
  const firstAttachment = status.media_attachments[0];

  let media: JSX.Element | null = null;

  const renderLoadingMediaGallery = (): JSX.Element => <div className='media_gallery' style={{ height: '285px' }} />;

  const renderLoadingVideoPlayer = (): JSX.Element => (
    <div className='relative mt-2 block cursor-pointer border-0 bg-cover bg-center bg-no-repeat' style={{ height: '285px' }} />
  );

  const renderLoadingAudioPlayer = (): JSX.Element => (
    <div className='relative mt-2 block cursor-pointer border-0 bg-cover bg-center bg-no-repeat' style={{ height: '285px' }} />
  );

  const openMedia = (media: Array<MediaAttachment>, index: number) => {
    openModal('MEDIA', { media, statusId: status.id, index });
  };

  if (size > 0 && firstAttachment) {
    if (muted) {
      media = (
        <AttachmentThumbs
          status={status}
          onClick={onClick}
        />
      );
    } else if (size === 1 && firstAttachment.type === 'video') {
      const video = firstAttachment;

      media = (
        <Suspense fallback={renderLoadingVideoPlayer()}>
          <Video
            preview={video.preview_url}
            blurhash={video.blurhash}
            src={video.url}
            alt={video.description}
            aspectRatio={Number(video.meta.original?.aspect)}
            height={285}
            visible={visible}
            inline
          />
        </Suspense>
      );
    } else if (size === 1 && firstAttachment.type === 'audio') {
      const attachment = firstAttachment;

      media = (
        <Suspense fallback={renderLoadingAudioPlayer()}>
          <Audio
            src={attachment.url}
            alt={attachment.description}
            poster={attachment.preview_url !== attachment.url ? attachment.preview_url : status.account.avatar_static}
            backgroundColor={attachment.meta.colors?.background}
            foregroundColor={attachment.meta.colors?.foreground}
            accentColor={attachment.meta.colors?.accent}
            duration={attachment.meta.original?.duration || 0}
            height={263}
          />
        </Suspense>
      );
    } else {
      media = (
        <Suspense fallback={renderLoadingMediaGallery()}>
          <MediaGallery
            media={status.media_attachments}
            height={285}
            onOpenMedia={openMedia}
            visible={visible}
          />
        </Suspense>
      );
    }
  } else if (!status.quote_id && status.card) {
    media = (
      <PreviewCard
        onOpenMedia={openMedia}
        card={status.card}
        compact
      />
    );
  } else if (status.expectsCard) {
    media = (
      <PlaceholderCard />
    );
  }

  if (media) {
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div onClick={e => e.stopPropagation()}>
        {media}
      </div>
    );
  } else {
    return null;
  }
};

export { StatusMedia as default };
