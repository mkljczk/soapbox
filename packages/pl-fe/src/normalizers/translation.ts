import emojify from 'pl-fe/features/emoji';
import { makeEmojiMap } from 'pl-fe/utils/normalizers';

import type { Status, Translation as BaseTranslation } from 'pl-api';

const normalizeTranslation = (translation: BaseTranslation, status: Pick<Status, 'emojis'>) => {
  const emojiMap = makeEmojiMap(status.emojis);
  const content = emojify(translation.content, emojiMap);

  return {
    ...translation,
    content,
  };
};

type Translation = ReturnType<typeof normalizeTranslation>;

export { normalizeTranslation, type Translation };
