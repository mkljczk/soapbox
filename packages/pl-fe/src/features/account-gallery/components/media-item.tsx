import clsx from 'clsx';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Blurhash from 'pl-fe/components/blurhash';
import Icon from 'pl-fe/components/icon';
import StillImage from 'pl-fe/components/still-image';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { isIOS } from 'pl-fe/is-mobile';

import type { AccountGalleryAttachment } from 'pl-fe/hooks/use-account-gallery';

interface IMediaItem {
  attachment: AccountGalleryAttachment;
  onOpenMedia: (attachment: AccountGalleryAttachment) => void;
  isLast?: boolean;
}

const MediaItem: React.FC<IMediaItem> = ({ attachment, onOpenMedia, isLast }) => {
  const { autoPlayGif, displayMedia } = useSettings();
  const [visible, setVisible] = useState<boolean>(displayMedia !== 'hide_all' && !attachment.status?.sensitive || displayMedia === 'show_all');

  const handleMouseEnter: React.MouseEventHandler<HTMLVideoElement> = e => {
    const video = e.target as HTMLVideoElement;
    if (hoverToPlay()) {
      video.play();
    }
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLVideoElement> = e => {
    const video = e.target as HTMLVideoElement;
    if (hoverToPlay()) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const hoverToPlay = () => !autoPlayGif && ['gifv', 'video'].includes(attachment.type);

  const handleClick: React.MouseEventHandler = e => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();

      if (visible) {
        onOpenMedia(attachment);
      } else {
        setVisible(true);
      }
    }
  };

  const status = attachment.status;
  const title = status.spoiler_text || attachment.description;

  let thumbnail: React.ReactNode = '';
  let icon;

  if (attachment.type === 'unknown') {
    // Skip
  } else if (attachment.type === 'image') {
    const focusX = Number(attachment.meta?.focus?.x) || 0;
    const focusY = Number(attachment.meta?.focus?.y) || 0;
    const x = ((focusX /  2) + .5) * 100;
    const y = ((focusY / -2) + .5) * 100;

    thumbnail = (
      <StillImage
        src={attachment.preview_url}
        alt={attachment.description}
        style={{ objectPosition: `${x}% ${y}%` }}
        className={clsx('size-full overflow-hidden', { 'rounded-br-md': isLast })}
      />
    );
  } else if (['gifv', 'video'].indexOf(attachment.type) !== -1) {
    const conditionalAttributes: React.VideoHTMLAttributes<HTMLVideoElement> = {};
    if (isIOS()) {
      conditionalAttributes.playsInline = true;
    }
    if (autoPlayGif) {
      conditionalAttributes.autoPlay = true;
    }
    thumbnail = (
      <div className={clsx('media-gallery__gifv', { autoplay: autoPlayGif })}>
        <video
          className={clsx('media-gallery__item-gifv-thumbnail overflow-hidden', { 'rounded-br-md': isLast })}
          aria-label={attachment.description}
          title={attachment.description}
          role='application'
          src={attachment.url}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          loop
          muted
          {...conditionalAttributes}
        />

        <span className='media-gallery__gifv__label'>GIF</span>
      </div>
    );
  } else if (attachment.type === 'audio') {
    const remoteURL = attachment.remote_url || '';
    const fileExtensionLastIndex = remoteURL.lastIndexOf('.');
    const fileExtension = remoteURL.slice(fileExtensionLastIndex + 1).toUpperCase();
    thumbnail = (
      <div className={clsx('media-gallery__item-thumbnail', { 'rounded-br-md': isLast })}>
        <span className='media-gallery__item__icons'><Icon src={require('@tabler/icons/outline/volume.svg')} /></span>
        <span className='media-gallery__file-extension__label'>{fileExtension}</span>
      </div>
    );
  }

  if (!visible) {
    icon = (
      <span className='media-gallery__item__icons'>
        <Icon src={require('@tabler/icons/outline/eye-off.svg')} />
      </span>
    );
  }

  return (
    <div className='col-span-1'>
      <Link className='media-gallery__item-thumbnail aspect-1' to={`/@${status.account.acct}/posts/${status.id}`} onClick={handleClick} title={title}>
        <Blurhash
          hash={attachment.blurhash}
          className={clsx('media-gallery__preview', {
            'hidden': visible,
            'rounded-br-md': isLast,
          })}
        />
        {visible && thumbnail}
        {!visible && icon}
      </Link>
    </div>
  );
};

export { MediaItem as default };
