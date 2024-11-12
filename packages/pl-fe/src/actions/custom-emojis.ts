import { getClient } from 'pl-fe/api';

import type { CustomEmoji } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const CUSTOM_EMOJIS_FETCH_REQUEST = 'CUSTOM_EMOJIS_FETCH_REQUEST' as const;
const CUSTOM_EMOJIS_FETCH_SUCCESS = 'CUSTOM_EMOJIS_FETCH_SUCCESS' as const;
const CUSTOM_EMOJIS_FETCH_FAIL = 'CUSTOM_EMOJIS_FETCH_FAIL' as const;

const fetchCustomEmojis = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const me = getState().me;
    if (!me) return;

    dispatch(fetchCustomEmojisRequest());

    return getClient(getState()).instance.getCustomEmojis().then(response => {
      dispatch(fetchCustomEmojisSuccess(response));
    }).catch(error => {
      dispatch(fetchCustomEmojisFail(error));
    });
  };

const fetchCustomEmojisRequest = () => ({
  type: CUSTOM_EMOJIS_FETCH_REQUEST,
});

const fetchCustomEmojisSuccess = (custom_emojis: Array<CustomEmoji>) => ({
  type: CUSTOM_EMOJIS_FETCH_SUCCESS,
  custom_emojis,
});

const fetchCustomEmojisFail = (error: unknown) => ({
  type: CUSTOM_EMOJIS_FETCH_FAIL,
  error,
});

type CustomEmojisAction =
  ReturnType<typeof fetchCustomEmojisRequest>
  | ReturnType<typeof fetchCustomEmojisSuccess>
  | ReturnType<typeof fetchCustomEmojisFail>;

export {
  CUSTOM_EMOJIS_FETCH_REQUEST,
  CUSTOM_EMOJIS_FETCH_SUCCESS,
  CUSTOM_EMOJIS_FETCH_FAIL,
  fetchCustomEmojis,
  fetchCustomEmojisRequest,
  fetchCustomEmojisSuccess,
  fetchCustomEmojisFail,
  type CustomEmojisAction,
};
