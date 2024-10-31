import FlexSearch from 'flexsearch';

import type { EmojiData } from './data';
import type { Emoji } from './index';
import type { CustomEmoji } from 'pl-api';

let emojis: EmojiData['emojis'] = {};

import('./data').then(data => {
  emojis = data.emojis;

  const sortedEmojis = Object.entries(emojis).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [key, emoji] of sortedEmojis) {
    index.add('n' + key, `${emoji.id} ${emoji.name} ${emoji.keywords.join(' ')}`);
  }
}).catch(() => { });

const index = new FlexSearch.Index({
  tokenize: 'full',
  optimize: true,
  context: true,
});

interface searchOptions {
  maxResults?: number;
  custom?: any;
}

const addCustomToPool = (customEmojis: any[]) => {
  // @ts-ignore
  for (const key in index.register) {
    if (key[0] === 'c') {
      index.remove(key); // remove old custom emojis
    }
  }

  let i = 0;

  for (const emoji of customEmojis) {
    index.add('c' + i++, emoji.id);
  }
};

// we can share an index by prefixing custom emojis with 'c' and native with 'n'
const search = (
  str: string, { maxResults = 5 }: searchOptions = {},
  custom_emojis?: Array<CustomEmoji>,
): Emoji[] => index.search(str, maxResults)
  .flatMap((id) => {
    if (typeof id !== 'string') return;

    if (id[0] === 'c' && custom_emojis) {
      const index = Number(id.slice(1));
      const custom = custom_emojis[index];

      if (custom) {
        return {
          id: custom.shortcode,
          colons: ':' + custom.shortcode + ':',
          custom: true,
          imageUrl: custom.static_url,
        };
      }
    }

    const skins = emojis[id.slice(1)]?.skins;

    if (skins) {
      return {
        id: id.slice(1),
        colons: ':' + id.slice(1) + ':',
        unified: skins[0].unified,
        native: skins[0].native,
      };
    }
  }).filter(Boolean) as Emoji[];

export { search as default, addCustomToPool };
