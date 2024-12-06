import { MediaAttachment } from 'pl-api';
import React, { useState } from 'react';

interface IPlaceholderMediaGallery {
  media: Array<MediaAttachment>;
  defaultWidth?: number;
}

interface SizeData {
  style: React.CSSProperties;
  itemsDimensions: Record<string, string>[];
  size: number;
  width: number;
}

const PlaceholderMediaGallery: React.FC<IPlaceholderMediaGallery> = ({ media, defaultWidth }) => {
  const [width, setWidth] = useState(defaultWidth);

  const handleRef = (node: HTMLDivElement) => {
    if (node) {
      setWidth(node.offsetWidth);
    }
  };

  const getSizeData = (size: number): SizeData => {
    const style: React.CSSProperties = {};
    let itemsDimensions: Record<string, string>[] = [];

    if (size === 1) {
      style.height = width! * 9 / 16;

      itemsDimensions = [
        { w: '100%', h: '100%' },
      ];
    } else if (size === 2) {
      style.height = width! / 2;

      itemsDimensions = [
        { w: '50%', h: '100%', r: '2px' },
        { w: '50%', h: '100%', l: '2px' },
      ];
    } else if (size === 3) {
      style.height = width;

      itemsDimensions = [
        { w: '50%', h: '50%', b: '2px', r: '2px' },
        { w: '50%', h: '50%', b: '2px', l: '2px' },
        { w: '100%', h: '50%', t: '2px' },
      ];
    } else if (size >= 4) {
      style.height = width;

      itemsDimensions = [
        { w: '50%', h: '50%', b: '2px', r: '2px' },
        { w: '50%', h: '50%', b: '2px', l: '2px' },
        { w: '50%', h: '50%', t: '2px', r: '2px' },
        { w: '50%', h: '50%', t: '2px', l: '2px' },
      ];
    }

    return {
      style,
      itemsDimensions,
      size,
      width: width || 0,
    };
  };

  const renderItem = (dimensions: Record<string, string>, i: number) => {
    const width = dimensions.w;
    const height = dimensions.h;
    const top = dimensions.t || 'auto';
    const right = dimensions.r || 'auto';
    const bottom = dimensions.b || 'auto';
    const left = dimensions.l || 'auto';
    const float = dimensions.float as any || 'left';
    const position = dimensions.pos as any || 'relative';

    return <div key={i} className='media-gallery__item animate-pulse bg-primary-200' style={{ position, float, left, top, right, bottom, height, width }} />;
  };

  const sizeData = getSizeData(media.length);

  return (
    <div className='media-gallery media-gallery--placeholder' style={sizeData.style} ref={handleRef}>
      {media.slice(0, 4).map((_, i) => renderItem(sizeData.itemsDimensions[i], i))}
    </div>
  );
};

export { PlaceholderMediaGallery as default };
