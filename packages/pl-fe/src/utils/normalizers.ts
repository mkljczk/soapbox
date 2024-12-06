import type { CustomEmoji } from 'pl-api';

const makeEmojiMap = (emojis: Array<CustomEmoji>) => emojis.reduce((obj: Record<string, CustomEmoji>, emoji: CustomEmoji) => {
  obj[`:${emoji.shortcode}:`] = emoji;
  return obj;
}, {});

export {
  makeEmojiMap,
};
