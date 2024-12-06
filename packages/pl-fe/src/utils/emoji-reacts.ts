import { emojiReactionSchema, type EmojiReaction } from 'pl-api';
import * as v from 'valibot';

const simulateEmojiReact = (emojiReacts: Array<EmojiReaction>, emoji: string, url?: string) => {
  const idx = emojiReacts.findIndex(e => e.name === emoji);
  const emojiReact = emojiReacts[idx];

  if (idx > -1 && emojiReact) {
    return emojiReacts.map((reaction, id) => id === idx ? v.parse(emojiReactionSchema, {
      ...emojiReact,
      count: (emojiReact.count || 0) + 1,
      me: true,
      url,
    }) : reaction);
  } else {
    return [...emojiReacts, v.parse(emojiReactionSchema, {
      count: 1,
      me: true,
      name: emoji,
      url,
    })];
  }
};

const simulateUnEmojiReact = (emojiReacts: Array<EmojiReaction>, emoji: string) => {
  const idx = emojiReacts.findIndex(e =>
    e.name === emoji && e.me === true);

  const emojiReact = emojiReacts[idx];

  if (emojiReact) {
    const newCount = (emojiReact.count || 1) - 1;
    if (newCount < 1) return emojiReacts.filter((_, id) => id !== idx);
    return emojiReacts.map((reaction, id) => id === idx ? v.parse(emojiReactionSchema, {
      ...emojiReact,
      count: (emojiReact.count || 1) - 1,
      me: false,
    }) : reaction);
  } else {
    return emojiReacts;
  }
};

export {
  simulateEmojiReact,
  simulateUnEmojiReact,
};
