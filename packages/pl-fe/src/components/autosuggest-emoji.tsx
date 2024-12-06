import React from 'react';

import { isCustomEmoji } from 'pl-fe/features/emoji';
import unicodeMapping from 'pl-fe/features/emoji/mapping';
import { joinPublicPath } from 'pl-fe/utils/static';

import type { Emoji } from 'pl-fe/features/emoji';

interface IAutosuggestEmoji {
  emoji: Emoji;
}

const AutosuggestEmoji: React.FC<IAutosuggestEmoji> = ({ emoji }) => {
  let url, alt;

  if (isCustomEmoji(emoji)) {
    url = emoji.imageUrl;
    alt = emoji.colons;
  } else {
    const mapping = unicodeMapping[emoji.native] || unicodeMapping[emoji.native.replace(/\uFE0F$/, '')];

    if (!mapping) {
      return null;
    }

    url = joinPublicPath(`packs/emoji/${mapping.unified}.svg`);
    alt = emoji.native;
  }

  return (
    <div className='flex flex-row items-center justify-start text-sm leading-[18px]' data-testid='emoji'>
      <img
        className='emojione mr-2 block size-4'
        src={url}
        alt={alt}
      />

      {emoji.colons}
    </div>
  );
};

export { AutosuggestEmoji as default };
