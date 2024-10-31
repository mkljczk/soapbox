import split from 'graphemesplit';
import React from 'react';

import { makeEmojiMap } from 'pl-fe/utils/normalizers';

import unicodeMapping from './mapping';

import { validEmojiChar } from '.';

import type { CustomEmoji } from 'pl-api';

interface IMaybeEmoji {
  text: string;
  emojis: Record<string, CustomEmoji>;
}

const MaybeEmoji: React.FC<IMaybeEmoji> = ({ text, emojis }) => {
  if (text.length < 3) return text;
  if (text in emojis) {
    const emoji = emojis[text];
    const filename = emoji.static_url;

    if (filename?.length > 0) {
      return <img draggable={false} className='emojione' alt={text} title={text} src={filename} />;
    }
  }

  return text;
};

interface IEmojify {
  text: string;
  emojis?: Array<CustomEmoji> | Record<string, CustomEmoji>;
}

const Emojify: React.FC<IEmojify> = ({ text, emojis = {} }) => React.useMemo(() => {
  if (Array.isArray(emojis)) emojis = makeEmojiMap(emojis);

  const nodes = [];

  let stack = '';
  let open = false;

  const clearStack = () => {
    if (stack.length) nodes.push(stack);
    open = false;
    stack = '';
  };

  const splitText = split(text);

  for (const index in splitText) {
    let c = splitText[index];

    // convert FE0E selector to FE0F so it can be found in unimap
    if (c.codePointAt(c.length - 1) === 65038) {
      c = c.slice(0, -1) + String.fromCodePoint(65039);
    }

    // unqualified emojis aren't in emoji-mart's mappings so we just add FEOF
    const unqualified = c + String.fromCodePoint(65039);

    if (c in unicodeMapping) {
      clearStack();

      const { unified, shortcode } = unicodeMapping[c];

      nodes.push(
        <img key={index} draggable={false} className='emojione' alt={c} title={`:${shortcode}:`} src={`/packs/emoji/${unified}.svg`} />,
      );
    } else if (unqualified in unicodeMapping) {
      clearStack();

      const { unified, shortcode } = unicodeMapping[unqualified];

      nodes.push(
        <img key={index} draggable={false} className='emojione' alt={unqualified} title={`:${shortcode}:`} src={`/packs/emoji/${unified}.svg`} />,
      );
    } else if (c === ':') {
      if (!open) {
        clearStack();
      }

      stack += ':';

      // we see another : we convert it and clear the stack buffer
      if (open) {
        nodes.push(<MaybeEmoji key={index} text={stack} emojis={emojis} />);
        stack = '';
      }

      open = !open;
    } else {
      stack += c;

      if (open && !validEmojiChar(c)) {
        clearStack();
      }
    }
  }

  if (stack.length) nodes.push(stack);

  return nodes;
}, [text, emojis]);

export { Emojify as default };
