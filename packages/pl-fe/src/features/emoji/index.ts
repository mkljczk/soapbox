import type { Emoji as EmojiMart, CustomEmoji as EmojiMartCustom } from './data';
import type { CustomEmoji as BaseCustomEmoji } from 'pl-api';

/*
 * TODO: Consolate emoji object types
 *
 * There are five different emoji objects currently
 *  - emoji-mart's "onPickEmoji" handler
 *  - emoji-mart's custom emoji types
 *  - an Emoji type that is either NativeEmoji or CustomEmoji
 *  - a type inside redux's `store.custom_emoji` immutablejs
 *
 * there needs to be one type for the picker handler callback
 * and one type for the emoji-mart data
 * and one type that is used everywhere that the above two are converted into
 */

interface CustomEmoji {
  id: string;
  colons: string;
  custom: true;
  imageUrl: string;
}

interface NativeEmoji {
  id: string;
  colons: string;
  custom?: false;
  unified: string;
  native: string;
}

type Emoji = CustomEmoji | NativeEmoji;

const isCustomEmoji = (emoji: Emoji): emoji is CustomEmoji =>
  (emoji as CustomEmoji).imageUrl !== undefined;

const isNativeEmoji = (emoji: Emoji): emoji is NativeEmoji =>
  (emoji as NativeEmoji).native !== undefined;

const isAlphaNumeric = (c: string) => {
  const code = c.charCodeAt(0);

  if (!(code > 47 && code < 58) &&  // numeric (0-9)
      !(code > 64 && code < 91) &&  // upper alpha (A-Z)
      !(code > 96 && code < 123)) { // lower alpha (a-z)
    return false;
  } else {
    return true;
  }
};

const validEmojiChar = (c: string) =>
  isAlphaNumeric(c) || ['_', '-', '.'].includes(c);

const buildCustomEmojis = (customEmojis: Array<BaseCustomEmoji>) => {
  const emojis: EmojiMart<EmojiMartCustom>[] = [];

  customEmojis.forEach((emoji: any) => {
    const shortcode = emoji.shortcode;
    const url = emoji.static_url;
    const name = shortcode.replace(':', '');

    emojis.push({
      id: name,
      name,
      keywords: [name],
      skins: [{ src: url }],
    });
  });

  return emojis;
};

export {
  type CustomEmoji,
  type NativeEmoji,
  type Emoji,
  isCustomEmoji,
  isNativeEmoji,
  buildCustomEmojis,
  validEmojiChar,
};
