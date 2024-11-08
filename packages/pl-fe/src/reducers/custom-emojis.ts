import { buildCustomEmojis } from 'pl-fe/features/emoji';
import { addCustomToPool } from 'pl-fe/features/emoji/search';

import { CUSTOM_EMOJIS_FETCH_SUCCESS, type CustomEmojisAction } from '../actions/custom-emojis';

import type { CustomEmoji } from 'pl-api';

const initialState: Array<CustomEmoji> = [];

const custom_emojis = (state = initialState, action: CustomEmojisAction) => {
  if (action.type === CUSTOM_EMOJIS_FETCH_SUCCESS) {
    addCustomToPool(buildCustomEmojis(action.custom_emojis));
    return action.custom_emojis;
  }

  return state;
};

export { custom_emojis as default };
