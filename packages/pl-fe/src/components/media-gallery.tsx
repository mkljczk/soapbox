import clsx from 'clsx';
import React, { useState, useRef, useLayoutEffect, CSSProperties } from 'react';

import Blurhash from 'pl-fe/components/blurhash';
import Icon from 'pl-fe/components/icon';
import StillImage from 'pl-fe/components/still-image';
import { MIMETYPE_ICONS } from 'pl-fe/components/upload';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { truncateFilename } from 'pl-fe/utils/media';

import { isIOS } from '../is-mobile';
import { isPanoramic, isPortrait, isNonConformingRatio, minimumAspectRatio, maximumAspectRatio } from '../utils/media-aspect-ratio';

import type { MediaAttachment } from 'pl-api';

const ATTACHMENT_LIMIT = 4;
const MAX_FILENAME_LENGTH = 45;

interface Dimensions {
  w: CSSProperties['width'];
  h: CSSProperties['height'];
  t?: CSSProperties['top'];
  r?: CSSProperties['right'];
  b?: CSSProperties['bottom'];
  l?: CSSProperties['left'];
  float?: CSSProperties['float'];
  pos?: CSSProperties['position'];
}

interface SizeData {
  style: CSSProperties;
  itemsDimensions: Dimensions[];
  size: number;
  width: number;
}

const getAspectRatio = (attachment: MediaAttachment) =>
  (attachment.type === 'gifv' || attachment.type === 'image' || attachment.type === 'video') && attachment.meta.original?.aspect || null;

const withinLimits = (aspectRatio: number) =>
  aspectRatio >= minimumAspectRatio && aspectRatio <= maximumAspectRatio;

const shouldLetterbox = (attachment: MediaAttachment): boolean => {
  const aspectRatio = getAspectRatio(attachment);
  if (!aspectRatio) return true;

  return !withinLimits(aspectRatio);
};

interface IItem {
  attachment: MediaAttachment;
  standalone?: boolean;
  index: number;
  size: number;
  onClick: (index: number) => void;
  displayWidth?: number;
  dimensions: Dimensions;
  last?: boolean;
  total: number;
  visible?: boolean;
}

const Item: React.FC<IItem> = ({
  attachment,
  index,
  onClick,
  standalone = false,
  dimensions,
  last,
  total,
  visible,
}) => {
  const { autoPlayGif } = useSettings();
  const { mediaPreview } = usePlFeConfig();

  const handleMouseEnter: React.MouseEventHandler<HTMLVideoElement> = ({ currentTarget: video }) => {
    if (hoverToPlay()) {
      video.play();
    }
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLVideoElement> = ({ currentTarget: video }) => {
    if (hoverToPlay()) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const hoverToPlay = () => !autoPlayGif && attachment.type === 'gifv';

  // FIXME: wtf?
  const handleClick: React.MouseEventHandler = (e: any) => {
    if (isIOS() && !e.target.autoPlay) {
      e.target.autoPlay = true;
      e.preventDefault();
    } else {
      if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
        if (hoverToPlay()) {
          e.target.pause();
          e.target.currentTime = 0;
        }
        e.preventDefault();
        onClick(index);
      }
    }

    e.stopPropagation();
  };

  const handleVideoHover: React.MouseEventHandler<HTMLVideoElement> = ({ currentTarget: video }) => {
    video.playbackRate = 3.0;
    video.play();
  };

  const handleVideoLeave: React.MouseEventHandler<HTMLVideoElement> = ({ currentTarget: video }) => {
    video.pause();
    video.currentTime = 0;
  };

  let width: Dimensions['w'] = 100;
  let height: Dimensions['h'] = '100%';
  let top: Dimensions['t'] = 'auto';
  let left: Dimensions['l'] = 'auto';
  let bottom: Dimensions['b'] = 'auto';
  let right: Dimensions['r'] = 'auto';
  let float: Dimensions['float'] = 'left';
  let position: Dimensions['pos'] = 'relative';

  if (dimensions) {
    width = dimensions.w;
    height = dimensions.h;
    top = dimensions.t || 'auto';
    right = dimensions.r || 'auto';
    bottom = dimensions.b || 'auto';
    left = dimensions.l || 'auto';
    float = dimensions.float || 'left';
    position = dimensions.pos || 'relative';
  }

  let thumbnail: React.ReactNode = '';
  const ext = attachment.url.split('.').pop()?.toLowerCase();

  if (attachment.type === 'unknown') {
    const filename = truncateFilename(attachment.url, MAX_FILENAME_LENGTH);
    const attachmentIcon = (
      <Icon
        className='size-16 text-gray-800 dark:text-gray-200'
        src={MIMETYPE_ICONS[attachment.mime_type as string] || require('@tabler/icons/outline/paperclip.svg')}
      />
    );

    return (
      <div
        className={clsx('media-gallery__item', standalone)}
        key={attachment.id}
        style={{ position, float, left, top, right, bottom, height, width: `${width}%` }}
      >
        <a className='media-gallery__item-thumbnail' href={attachment.url} target='_blank' style={{ cursor: 'pointer' }}>
          <Blurhash hash={attachment.blurhash} className='media-gallery__preview' />
          <span className='media-gallery__item__icons'>{attachmentIcon}</span>
          <span className='media-gallery__filename__label'>{filename}</span>
        </a>
      </div>
    );
  } else if (attachment.type === 'image') {
    const letterboxed = total === 1 && shouldLetterbox(attachment);

    thumbnail = (
      <a
        className='media-gallery__item-thumbnail'
        href={attachment.url}
        onClick={handleClick}
        target='_blank'
      >
        <StillImage
          className='size-full'
          src={mediaPreview ? attachment.preview_url : attachment.url}
          alt={attachment.description}
          letterboxed={letterboxed}
          showExt
        />
      </a>
    );
  } else if (attachment.type === 'gifv') {
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
          className='media-gallery__item-gifv-thumbnail'
          aria-label={attachment.description}
          title={attachment.description}
          role='application'
          src={attachment.url}
          onClick={handleClick}
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
    thumbnail = (
      <a
        className={clsx('media-gallery__item-thumbnail')}
        href={attachment.url}
        onClick={handleClick}
        target='_blank'
        title={attachment.description}
      >
        <span className='media-gallery__item__icons'><Icon src={require('@tabler/icons/outline/volume.svg')} /></span>
        <span className='media-gallery__file-extension__label uppercase'>{ext}</span>
      </a>
    );
  } else if (attachment.type === 'video') {
    thumbnail = (
      <a
        className={clsx('media-gallery__item-thumbnail')}
        href={attachment.url}
        onClick={handleClick}
        target='_blank'
        title={attachment.description}
      >
        <video
          muted
          loop
          onMouseOver={handleVideoHover}
          onMouseOut={handleVideoLeave}
        >
          <source src={attachment.url} />
        </video>
        <span className='media-gallery__file-extension__label uppercase'>{ext}</span>
      </a>
    );
  }

  return (
    <div
      className={clsx('media-gallery__item', `media-gallery__item--${attachment.type}`, standalone)}
      key={attachment.id}
      style={{ position, float, left, top, right, bottom, height, width: `${width}%` }}
    >
      {last && total > ATTACHMENT_LIMIT && (
        <div className='media-gallery__item-overflow'>
          +{total - ATTACHMENT_LIMIT + 1}
        </div>
      )}
      <Blurhash
        hash={attachment.blurhash}
        className='media-gallery__preview'
      />
      {(visible || !attachment.blurhash) && thumbnail}
    </div>
  );
};

interface IMediaGallery {
  media: Array<MediaAttachment>;
  height?: number;
  onOpenMedia: (media: Array<MediaAttachment>, index: number) => void;
  defaultWidth?: number;
  cacheWidth?: (width: number) => void;
  displayMedia?: string;
  compact?: boolean;
  className?: string;
  visible?: boolean;
}

const MediaGallery: React.FC<IMediaGallery> = (props) => {
  const {
    media,
    defaultWidth = 0,
    className,
    onOpenMedia,
    cacheWidth,
    compact,
    height,
    visible,
  } = props;

  const [width, setWidth] = useState<number>(defaultWidth);

  const node = useRef<HTMLDivElement>(null);

  const handleClick = (index: number) => {
    onOpenMedia(media, index);
  };

  const getSizeDataSingle = (): SizeData => {
    const w = width || defaultWidth;
    const aspectRatio = getAspectRatio(media[0]);

    const getHeight = () => {
      if (!aspectRatio) return w * 9 / 16;
      if (isPanoramic(aspectRatio)) return Math.floor(w / maximumAspectRatio);
      if (isPortrait(aspectRatio)) return Math.floor(w / minimumAspectRatio);
      return Math.floor(w / aspectRatio);
    };

    return {
      style: { height: getHeight() },
      itemsDimensions: [],
      size: 1,
      width,
    };
  };

  const getSizeDataMultiple = (size: number): SizeData => {
    const w = width || defaultWidth;
    const panoSize = Math.floor(w / maximumAspectRatio);
    const panoSize_px = `${Math.floor(w / maximumAspectRatio)}px`;

    const style: CSSProperties = {};
    let itemsDimensions: Dimensions[] = [];

    const ratios = Array(size).fill(null).map((_, i) => getAspectRatio(media[i]));

    const [ar1, ar2, ar3, ar4] = ratios;

    if (size === 2) {
      if (isPortrait(ar1) && isPortrait(ar2)) {
        style.height = w - (w / maximumAspectRatio);
      } else if (isPanoramic(ar1) && isPanoramic(ar2)) {
        style.height = panoSize * 2;
      } else if (
        (isPanoramic(ar1) && isPortrait(ar2)) ||
        (isPortrait(ar1) && isPanoramic(ar2)) ||
        (isPanoramic(ar1) && isNonConformingRatio(ar2)) ||
        (isNonConformingRatio(ar1) && isPanoramic(ar2))
      ) {
        style.height = (w * 0.6) + (w / maximumAspectRatio);
      } else {
        style.height = w / 2;
      }

      if (isPortrait(ar1) && isPortrait(ar2)) {
        itemsDimensions = [
          { w: 50, h: '100%', r: '1px' },
          { w: 50, h: '100%', l: '1px' },
        ];
      } else if (isPanoramic(ar1) && isPanoramic(ar2)) {
        itemsDimensions = [
          { w: 100, h: panoSize_px, b: '1px' },
          { w: 100, h: panoSize_px, t: '1px' },
        ];
      } else if (
        (isPanoramic(ar1) && isPortrait(ar2)) ||
        (isPanoramic(ar1) && isNonConformingRatio(ar2))
      ) {
        itemsDimensions = [
          { w: 100, h: `${(w / maximumAspectRatio)}px`, b: '1px' },
          { w: 100, h: `${(w * 0.6)}px`, t: '1px' },
        ];
      } else if (
        (isPortrait(ar1) && isPanoramic(ar2)) ||
        (isNonConformingRatio(ar1) && isPanoramic(ar2))
      ) {
        itemsDimensions = [
          { w: 100, h: `${(w * 0.6)}px`, b: '1px' },
          { w: 100, h: `${(w / maximumAspectRatio)}px`, t: '1px' },
        ];
      } else {
        itemsDimensions = [
          { w: 50, h: '100%', r: '1px' },
          { w: 50, h: '100%', l: '1px' },
        ];
      }
    } else if (size === 3) {
      if (isPanoramic(ar1) && isPanoramic(ar2) && isPanoramic(ar3)) {
        style.height = panoSize * 3;
      } else if (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3)) {
        style.height = Math.floor(w / minimumAspectRatio);
      } else {
        style.height = w;
      }

      if (isPanoramic(ar1) && isNonConformingRatio(ar2) && isNonConformingRatio(ar3)) {
        itemsDimensions = [
          { w: 100, h: '50%', b: '1px' },
          { w: 50, h: '50%', t: '1px', r: '1px' },
          { w: 50, h: '50%', t: '1px', l: '1px' },
        ];
      } else if (isPanoramic(ar1) && isPanoramic(ar2) && isPanoramic(ar3)) {
        itemsDimensions = [
          { w: 100, h: panoSize_px, b: '4px' },
          { w: 100, h: panoSize_px },
          { w: 100, h: panoSize_px, t: '4px' },
        ];
      } else if (isPortrait(ar1) && isNonConformingRatio(ar2) && isNonConformingRatio(ar3)) {
        itemsDimensions = [
          { w: 50, h: '100%', r: '1px' },
          { w: 50, h: '50%', b: '1px', l: '1px' },
          { w: 50, h: '50%', t: '1px', l: '1px' },
        ];
      } else if (isNonConformingRatio(ar1) && isNonConformingRatio(ar2) && isPortrait(ar3)) {
        itemsDimensions = [
          { w: 50, h: '50%', b: '1px', r: '1px' },
          { w: 50, h: '50%', l: '-2px', b: '-2px', pos: 'absolute', float: 'none' },
          { w: 50, h: '100%', r: '-2px', t: '0px', b: '0px', pos: 'absolute', float: 'none' },
        ];
      } else if (
        (isNonConformingRatio(ar1) && isPortrait(ar2) && isNonConformingRatio(ar3)) ||
        (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3))
      ) {
        itemsDimensions = [
          { w: 50, h: '50%', b: '1px', r: '1px' },
          { w: 50, h: '100%', l: '1px', float: 'right' },
          { w: 50, h: '50%', t: '1px', r: '1px' },
        ];
      } else if (
        (isPanoramic(ar1) && isPanoramic(ar2) && isNonConformingRatio(ar3)) ||
        (isPanoramic(ar1) && isPanoramic(ar2) && isPortrait(ar3))
      ) {
        itemsDimensions = [
          { w: 50, h: panoSize_px, b: '1px', r: '1px' },
          { w: 50, h: panoSize_px, b: '1px', l: '1px' },
          { w: 100, h: `${w - panoSize}px`, t: '1px' },
        ];
      } else if (
        (isNonConformingRatio(ar1) && isPanoramic(ar2) && isPanoramic(ar3)) ||
        (isPortrait(ar1) && isPanoramic(ar2) && isPanoramic(ar3))
      ) {
        itemsDimensions = [
          { w: 100, h: `${w - panoSize}px`, b: '1px' },
          { w: 50, h: panoSize_px, t: '1px', r: '1px' },
          { w: 50, h: panoSize_px, t: '1px', l: '1px' },
        ];
      } else {
        itemsDimensions = [
          { w: 50, h: '50%', b: '1px', r: '1px' },
          { w: 50, h: '50%', b: '1px', l: '1px' },
          { w: 100, h: '50%', t: '1px' },
        ];
      }
    } else if (size >= 4) {
      if (
        (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3) && isPortrait(ar4)) ||
        (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3) && isNonConformingRatio(ar4)) ||
        (isPortrait(ar1) && isPortrait(ar2) && isNonConformingRatio(ar3) && isPortrait(ar4)) ||
        (isPortrait(ar1) && isNonConformingRatio(ar2) && isPortrait(ar3) && isPortrait(ar4)) ||
        (isNonConformingRatio(ar1) && isPortrait(ar2) && isPortrait(ar3) && isPortrait(ar4))
      ) {
        style.height = Math.floor(w / minimumAspectRatio);
      } else if (isPanoramic(ar1) && isPanoramic(ar2) && isPanoramic(ar3) && isPanoramic(ar4)) {
        style.height = panoSize * 2;
      } else if (
        (isPanoramic(ar1) && isPanoramic(ar2) && isNonConformingRatio(ar3) && isNonConformingRatio(ar4)) ||
        (isNonConformingRatio(ar1) && isNonConformingRatio(ar2) && isPanoramic(ar3) && isPanoramic(ar4))
      ) {
        style.height = panoSize + (w / 2);
      } else {
        style.height = w;
      }

      if (isPanoramic(ar1) && isPanoramic(ar2) && isNonConformingRatio(ar3) && isNonConformingRatio(ar4)) {
        itemsDimensions = [
          { w: 50, h: panoSize_px, b: '1px', r: '1px' },
          { w: 50, h: panoSize_px, b: '1px', l: '1px' },
          { w: 50, h: `${(w / 2)}px`, t: '1px', r: '1px' },
          { w: 50, h: `${(w / 2)}px`, t: '1px', l: '1px' },
        ];
      } else if (isNonConformingRatio(ar1) && isNonConformingRatio(ar2) && isPanoramic(ar3) && isPanoramic(ar4)) {
        itemsDimensions = [
          { w: 50, h: `${(w / 2)}px`, b: '1px', r: '1px' },
          { w: 50, h: `${(w / 2)}px`, b: '1px', l: '1px' },
          { w: 50, h: panoSize_px, t: '1px', r: '1px' },
          { w: 50, h: panoSize_px, t: '1px', l: '1px' },
        ];
      } else if (
        (isPortrait(ar1) && isNonConformingRatio(ar2) && isNonConformingRatio(ar3) && isNonConformingRatio(ar4)) ||
        (isPortrait(ar1) && isPanoramic(ar2) && isPanoramic(ar3) && isPanoramic(ar4))
      ) {
        itemsDimensions = [
          { w: 67, h: '100%', r: '1px' },
          { w: 33, h: '33%', b: '4px', l: '1px' },
          { w: 33, h: '33%', l: '1px' },
          { w: 33, h: '33%', t: '4px', l: '1px' },
        ];
      } else {
        itemsDimensions = [
          { w: 50, h: '50%', b: '1px', r: '1px' },
          { w: 50, h: '50%', b: '1px', l: '1px' },
          { w: 50, h: '50%', t: '1px', r: '1px' },
          { w: 50, h: '50%', t: '1px', l: '1px' },
        ];
      }
    }

    return {
      style,
      itemsDimensions,
      size,
      width: w,
    };
  };

  const getSizeData = (size: number): Readonly<SizeData> => {
    const w = width || defaultWidth;

    if (w) {
      if (size === 1) return getSizeDataSingle();
      if (size > 1) return getSizeDataMultiple(size);
    }

    return {
      style: { height },
      itemsDimensions: [],
      size,
      width: w,
    };
  };

  const sizeData: SizeData = getSizeData(media.length);

  const children = media.slice(0, ATTACHMENT_LIMIT).map((attachment, i) => (
    <Item
      key={attachment.id}
      onClick={handleClick}
      attachment={attachment}
      index={i}
      size={sizeData.size}
      displayWidth={sizeData.width}
      dimensions={sizeData.itemsDimensions[i]}
      last={i === ATTACHMENT_LIMIT - 1}
      total={media.length}
      visible={visible}
    />
  ));

  useLayoutEffect(() => {
    if (node.current) {
      const { offsetWidth } = node.current;

      if (cacheWidth) {
        cacheWidth(offsetWidth);
      }

      setWidth(offsetWidth);
    }
  }, [node.current]);

  return (
    <div
      className={clsx(className, 'media-gallery overflow-hidden rounded-md', {
        'media-gallery--compact !h-12 bg-transparent': compact,
      })}
      style={sizeData.style}
      ref={node}
    >
      {children}
    </div>
  );
};

export { MediaGallery as default };
