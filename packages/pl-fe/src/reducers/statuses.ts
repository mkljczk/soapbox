import { Map as ImmutableMap } from 'immutable';
import omit from 'lodash/omit';

import { normalizeStatus, Status as StatusRecord } from 'pl-fe/normalizers/status';
import { simulateEmojiReact, simulateUnEmojiReact } from 'pl-fe/utils/emoji-reacts';

import {
  EMOJI_REACT_FAIL,
  EMOJI_REACT_REQUEST,
  UNEMOJI_REACT_REQUEST,
  type EmojiReactsAction,
} from '../actions/emoji-reacts';
import {
  EVENT_JOIN_REQUEST,
  EVENT_JOIN_FAIL,
  EVENT_LEAVE_REQUEST,
  EVENT_LEAVE_FAIL,
  type EventsAction,
} from '../actions/events';
import { STATUS_IMPORT, STATUSES_IMPORT, type ImporterAction } from '../actions/importer';
import {
  REBLOG_REQUEST,
  REBLOG_FAIL,
  UNREBLOG_REQUEST,
  UNREBLOG_FAIL,
  FAVOURITE_REQUEST,
  UNFAVOURITE_REQUEST,
  FAVOURITE_FAIL,
  DISLIKE_REQUEST,
  UNDISLIKE_REQUEST,
  DISLIKE_FAIL,
  type InteractionsAction,
} from '../actions/interactions';
import {
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_FAIL,
  STATUS_DELETE_REQUEST,
  STATUS_DELETE_FAIL,
  STATUS_HIDE_MEDIA,
  STATUS_MUTE_SUCCESS,
  STATUS_REVEAL_MEDIA,
  STATUS_TRANSLATE_FAIL,
  STATUS_TRANSLATE_REQUEST,
  STATUS_TRANSLATE_SUCCESS,
  STATUS_TRANSLATE_UNDO,
  STATUS_UNFILTER,
  STATUS_UNMUTE_SUCCESS,
  STATUS_LANGUAGE_CHANGE,
  STATUS_COLLAPSE_SPOILER,
  STATUS_EXPAND_SPOILER,
  type StatusesAction,
} from '../actions/statuses';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';

import type { Status as BaseStatus, Translation } from 'pl-api';
import type { AnyAction } from 'redux';

type State = ImmutableMap<string, MinifiedStatus>;

type MinifiedStatus = ReturnType<typeof minifyStatus>;

const minifyStatus = (status: StatusRecord) => omit(status, ['reblog', 'poll', 'quote', 'group']);

// Check whether a status is a quote by secondary characteristics
const isQuote = (status: StatusRecord) => Boolean(status.quote_url);

// Preserve quote if an existing status already has it
const fixQuote = (status: StatusRecord, oldStatus?: StatusRecord): StatusRecord => {
  if (oldStatus && !status.quote && isQuote(status)) {
    return {
      ...status,
      quote: oldStatus.quote,
      quote_visible: status.quote_visible || oldStatus.quote_visible,
    };
  } else {
    return status;
  }
};

const fixStatus = (state: State, status: BaseStatus): MinifiedStatus => {
  const oldStatus = state.get(status.id);

  return minifyStatus(fixQuote(normalizeStatus(status, oldStatus)));
};

const importStatus = (state: State, status: BaseStatus): State =>
  state.set(status.id, fixStatus(state, status));

const importStatuses = (state: State, statuses: Array<BaseStatus>): State =>
  state.withMutations(mutable => statuses.forEach(status => importStatus(mutable, status)));

const deleteStatus = (state: State, statusId: string, references: Array<string>) => {
  references.forEach(ref => {
    state = deleteStatus(state, ref[0], []);
  });

  return state.delete(statusId);
};

const incrementReplyCount = (state: State, { in_reply_to_id, quote }: BaseStatus) => {
  if (in_reply_to_id && state.has(in_reply_to_id)) {
    const parent = state.get(in_reply_to_id)!;
    state = state.set(in_reply_to_id, {
      ...parent,
      replies_count: (typeof parent.replies_count === 'number' ? parent.replies_count : 0) + 1,
    });
  }

  if (quote?.id && state.has(quote.id)) {
    const parent = state.get(quote.id)!;
    state = state.set(quote.id, {
      ...parent,
      quotes_count: (typeof parent.quotes_count === 'number' ? parent.quotes_count : 0) + 1,
    });
  }

  return state;
};

const decrementReplyCount = (state: State, { in_reply_to_id, quote }: BaseStatus) => {
  if (in_reply_to_id) {
    state = state.updateIn([in_reply_to_id, 'replies_count'], 0, count =>
      typeof count === 'number' ? Math.max(0, count - 1) : 0,
    );
  }

  if (quote?.id) {
    state = state.updateIn([quote.id, 'quotes_count'], 0, count =>
      typeof count === 'number' ? Math.max(0, count - 1) : 0,
    );
  }

  return state;
};

/** Simulate favourite/unfavourite of status for optimistic interactions */
const simulateFavourite = (
  state: State,
  statusId: string,
  favourited: boolean,
): State => {
  const status = state.get(statusId);
  if (!status) return state;

  const delta = favourited ? +1 : -1;

  const updatedStatus = {
    ...status,
    favourited,
    favourites_count: Math.max(0, status.favourites_count + delta),
  };

  return state.set(statusId, updatedStatus);
};

/** Simulate dislike/undislike of status for optimistic interactions */
const simulateDislike = (
  state: State,
  statusId: string,
  disliked: boolean,
): State => {
  const status = state.get(statusId);
  if (!status) return state;

  const delta = disliked ? +1 : -1;

  const updatedStatus = ({
    ...status,
    disliked,
    dislikes_count: Math.max(0, status.dislikes_count + delta),
  });

  return state.set(statusId, updatedStatus);
};

/** Import translation from translation service into the store. */
const importTranslation = (state: State, statusId: string, translation: Translation) => {
  return state.update(statusId, undefined as any, (status) => ({
    ...status,
    translation: translation,
    translating: false,
  }));
};

/** Delete translation from the store. */
const deleteTranslation = (state: State, statusId: string) => state.deleteIn([statusId, 'translation']);

const initialState: State = ImmutableMap();

const statuses = (state = initialState, action: AnyAction | EmojiReactsAction | EventsAction | ImporterAction | InteractionsAction | StatusesAction | TimelineAction): State => {
  switch (action.type) {
    case STATUS_IMPORT:
      return importStatus(state, action.status);
    case STATUSES_IMPORT:
      return importStatuses(state, action.statuses);
    case STATUS_CREATE_REQUEST:
      return action.editing ? state : incrementReplyCount(state, action.params);
    case STATUS_CREATE_FAIL:
      return action.editing ? state : decrementReplyCount(state, action.params);
    case FAVOURITE_REQUEST:
      return simulateFavourite(state, action.statusId, true);
    case UNFAVOURITE_REQUEST:
      return simulateFavourite(state, action.statusId, false);
    case DISLIKE_REQUEST:
      return simulateDislike(state, action.statusId, true);
    case UNDISLIKE_REQUEST:
      return simulateDislike(state, action.statusId, false);
    case EMOJI_REACT_REQUEST:
      return state
        .updateIn(
          [action.statusId, 'emoji_reactions'],
          emojiReacts => simulateEmojiReact(emojiReacts as any, action.emoji, action.custom),
        );
    case UNEMOJI_REACT_REQUEST:
    case EMOJI_REACT_FAIL:
      return state
        .updateIn(
          [action.statusId, 'emoji_reactions'],
          emojiReacts => simulateUnEmojiReact(emojiReacts as any, action.emoji),
        );
    case FAVOURITE_FAIL:
      return state.get(action.statusId) === undefined ? state : state.setIn([action.statusId, 'favourited'], false);
    case DISLIKE_FAIL:
      return state.get(action.statusId) === undefined ? state : state.setIn([action.statusId, 'disliked'], false);
    case REBLOG_REQUEST:
      return state
        .updateIn([action.statusId, 'reblogs_count'], 0, (count) => typeof count === 'number' ? count + 1 : 1)
        .setIn([action.statusId, 'reblogged'], true);
    case REBLOG_FAIL:
      return state.get(action.statusId) === undefined ? state : state.setIn([action.statusId, 'reblogged'], false);
    case UNREBLOG_REQUEST:
      return state
        .updateIn([action.statusId, 'reblogs_count'], 0, (count) => typeof count === 'number' ? Math.max(0, count - 1) : 0)
        .setIn([action.statusId, 'reblogged'], false);
    case UNREBLOG_FAIL:
      return state.get(action.statusId) === undefined ? state : state.setIn([action.statusId, 'reblogged'], true);
    case STATUS_MUTE_SUCCESS:
      return state.setIn([action.statusId, 'muted'], true);
    case STATUS_UNMUTE_SUCCESS:
      return state.setIn([action.statusId, 'muted'], false);
    case STATUS_REVEAL_MEDIA:
      return state.withMutations(map => {
        action.statusIds.forEach((id: string) => {
          if (!(state.get(id) === undefined)) {
            map.setIn([id, 'hidden'], false);
          }
        });
      });
    case STATUS_HIDE_MEDIA:
      return state.withMutations(map => {
        action.statusIds.forEach((id: string) => {
          if (!(state.get(id) === undefined)) {
            map.setIn([id, 'hidden'], true);
          }
        });
      });
    case STATUS_EXPAND_SPOILER:
      return state.withMutations(map => {
        action.statusIds.forEach((id: string) => {
          if (!(state.get(id) === undefined)) {
            map.setIn([id, 'expanded'], true);
          }
        });
      });
    case STATUS_COLLAPSE_SPOILER:
      return state.withMutations(map => {
        action.statusIds.forEach((id: string) => {
          if (!(state.get(id) === undefined)) {
            map.setIn([id, 'expanded'], false);
          }
        });
      });
    case STATUS_DELETE_REQUEST:
      return decrementReplyCount(state, action.params);
    case STATUS_DELETE_FAIL:
      return incrementReplyCount(state, action.params);
    case STATUS_TRANSLATE_REQUEST:
      return state.setIn([action.statusId, 'translating'], true);
    case STATUS_TRANSLATE_SUCCESS:
      return importTranslation(state, action.statusId, action.translation);
    case STATUS_TRANSLATE_FAIL:
      return state
        .setIn([action.statusId, 'translating'], false)
        .setIn([action.statusId, 'translation'], false);
    case STATUS_TRANSLATE_UNDO:
      return deleteTranslation(state, action.statusId);
    case STATUS_UNFILTER:
      return state.setIn([action.statusId, 'showFiltered'], false);
    case STATUS_LANGUAGE_CHANGE:
      return state.setIn([action.statusId, 'currentLanguage'], action.language);
    case TIMELINE_DELETE:
      return deleteStatus(state, action.statusId, action.references);
    case EVENT_JOIN_REQUEST:
      return state.setIn([action.statusId, 'event', 'join_state'], 'pending');
    case EVENT_JOIN_FAIL:
    case EVENT_LEAVE_REQUEST:
      return state.setIn([action.statusId, 'event', 'join_state'], null);
    case EVENT_LEAVE_FAIL:
      return state.setIn([action.statusId, 'event', 'join_state'], action.previousState);
    default:
      return state;
  }
};

export {
  type MinifiedStatus,
  statuses as default,
};
