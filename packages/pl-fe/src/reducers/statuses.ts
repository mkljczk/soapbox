import omit from 'lodash/omit';
import { create } from 'mutative';

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
  STATUS_MUTE_SUCCESS,
  STATUS_UNFILTER,
  STATUS_UNMUTE_SUCCESS,
  type StatusesAction,
} from '../actions/statuses';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';

import type { Status as BaseStatus, CreateStatusParams } from 'pl-api';

type State = Record<string, MinifiedStatus>;

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
  const oldStatus = state[status.id];

  return minifyStatus(fixQuote(normalizeStatus(status, oldStatus)));
};

const importStatus = (state: State, status: BaseStatus) =>{
  state[status.id] = fixStatus(state, status);
};

const importStatuses = (state: State, statuses: Array<BaseStatus>) =>{
  statuses.forEach(status => importStatus(state, status));
};

const deleteStatus = (state: State, statusId: string, references: Array<[string, string]>) => {
  references.forEach(ref => {
    deleteStatus(state, ref[0], []);
  });

  delete state[statusId];
};

const incrementReplyCount = (state: State, { in_reply_to_id, quote_id }: Pick<BaseStatus | CreateStatusParams, 'in_reply_to_id' | 'quote_id'>) => {
  if (in_reply_to_id && state[in_reply_to_id]) {
    const parent = state[in_reply_to_id];
    parent.replies_count = (typeof parent.replies_count === 'number' ? parent.replies_count : 0) + 1;
  }

  if (quote_id && state[quote_id]) {
    const parent = state[quote_id];
    parent.quotes_count = (typeof parent.quotes_count === 'number' ? parent.quotes_count : 0) + 1;
  }

  return state;
};

const decrementReplyCount = (state: State, { in_reply_to_id, quote_id }: Pick<BaseStatus | CreateStatusParams, 'in_reply_to_id' | 'quote_id'>) => {
  if (in_reply_to_id && state[in_reply_to_id]) {
    const parent = state[in_reply_to_id];
    parent.replies_count = Math.max(0, parent.replies_count - 1);
  }

  if (quote_id) {
    const parent = state[quote_id];
    parent.quotes_count = Math.max(0, parent.quotes_count - 1);
  }

  return state;
};

/** Simulate favourite/unfavourite of status for optimistic interactions */
const simulateFavourite = (state: State, statusId: string, favourited: boolean) => {
  const status = state[statusId];
  if (!status) return state;

  const delta = favourited ? +1 : -1;

  const updatedStatus = {
    ...status,
    favourited,
    favourites_count: Math.max(0, status.favourites_count + delta),
  };

  state[statusId] = updatedStatus;
};

/** Simulate dislike/undislike of status for optimistic interactions */
const simulateDislike = (
  state: State,
  statusId: string,
  disliked: boolean,
) => {
  const status = state[statusId];
  if (!status) return state;

  const delta = disliked ? +1 : -1;

  const updatedStatus = ({
    ...status,
    disliked,
    dislikes_count: Math.max(0, status.dislikes_count + delta),
  });

  state[statusId] = updatedStatus;
};

const initialState: State = {};

const statuses = (state = initialState, action: EmojiReactsAction | EventsAction | ImporterAction | InteractionsAction | StatusesAction | TimelineAction): State => {
  switch (action.type) {
    case STATUS_IMPORT:
      return create(state, (draft) => importStatus(draft, action.status));
    case STATUSES_IMPORT:
      return create(state, (draft) => importStatuses(draft, action.statuses));
    case STATUS_CREATE_REQUEST:
      return action.editing ? state : create(state, (draft) => incrementReplyCount(draft, action.params));
    case STATUS_CREATE_FAIL:
      return action.editing ? state : create(state, (draft) => decrementReplyCount(draft, action.params));
    case FAVOURITE_REQUEST:
      return create(state, (draft) => simulateFavourite(draft, action.statusId, true));
    case UNFAVOURITE_REQUEST:
      return create(state, (draft) => simulateFavourite(draft, action.statusId, false));
    case DISLIKE_REQUEST:
      return create(state, (draft) => simulateDislike(draft, action.statusId, true));
    case UNDISLIKE_REQUEST:
      return create(state, (draft) => simulateDislike(draft, action.statusId, false));
    case EMOJI_REACT_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.emoji_reactions = simulateEmojiReact(status.emoji_reactions, action.emoji, action.custom);
        }
      });
    case UNEMOJI_REACT_REQUEST:
    case EMOJI_REACT_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.emoji_reactions = simulateUnEmojiReact(status.emoji_reactions, action.emoji);
        }
      });
    case FAVOURITE_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.favourited = false;
        }
      });
    case DISLIKE_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.disliked = false;
        }
      });
    case REBLOG_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.reblogs_count += 1;
          status.reblogged = true;
        }
      });
    case REBLOG_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.reblogged = false;
        }
      });
    case UNREBLOG_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.reblogs_count = Math.max(0, status.reblogs_count - 1);
          status.reblogged = false;
        }
      });
    case UNREBLOG_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.reblogged = true;
        }
      });
    case STATUS_MUTE_SUCCESS:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.muted = true;
        }
      });
    case STATUS_UNMUTE_SUCCESS:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.muted = false;
        }
      });
    case STATUS_DELETE_REQUEST:
      return create(state, (draft) => decrementReplyCount(draft, action.params));
    case STATUS_DELETE_FAIL:
      return create(state, (draft) => incrementReplyCount(draft, action.params));
    case STATUS_UNFILTER:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.showFiltered = false;
        }
      });
    case TIMELINE_DELETE:
      return create(state, (draft) => deleteStatus(draft, action.statusId, action.references));
    case EVENT_JOIN_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status?.event) {
          status.event.join_state = 'pending';
        }
      });
    case EVENT_JOIN_FAIL:
    case EVENT_LEAVE_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status?.event) {
          status.event.join_state = null;
        }
      });
    case EVENT_LEAVE_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status?.event) {
          status.event.join_state = action.previousState;
        }
      });
    default:
      return state;
  }
};

export {
  type MinifiedStatus,
  statuses as default,
};
