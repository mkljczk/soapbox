import { create } from 'mutative';
import { type CredentialAccount, type Instance, type MediaAttachment, type Tag } from 'pl-api';

import { INSTANCE_FETCH_SUCCESS, type InstanceAction } from 'pl-fe/actions/instance';
import { tagHistory } from 'pl-fe/settings';

import {
  COMPOSE_CHANGE,
  COMPOSE_REPLY,
  COMPOSE_REPLY_CANCEL,
  COMPOSE_QUOTE,
  COMPOSE_QUOTE_CANCEL,
  COMPOSE_GROUP_POST,
  COMPOSE_DIRECT,
  COMPOSE_MENTION,
  COMPOSE_SUBMIT_REQUEST,
  COMPOSE_SUBMIT_SUCCESS,
  COMPOSE_SUBMIT_FAIL,
  COMPOSE_UPLOAD_REQUEST,
  COMPOSE_UPLOAD_SUCCESS,
  COMPOSE_UPLOAD_FAIL,
  COMPOSE_UPLOAD_UNDO,
  COMPOSE_UPLOAD_PROGRESS,
  COMPOSE_SUGGESTIONS_CLEAR,
  COMPOSE_SUGGESTIONS_READY,
  COMPOSE_SUGGESTION_SELECT,
  COMPOSE_SUGGESTION_TAGS_UPDATE,
  COMPOSE_TAG_HISTORY_UPDATE,
  COMPOSE_SPOILERNESS_CHANGE,
  COMPOSE_TYPE_CHANGE,
  COMPOSE_SPOILER_TEXT_CHANGE,
  COMPOSE_VISIBILITY_CHANGE,
  COMPOSE_LANGUAGE_CHANGE,
  COMPOSE_MODIFIED_LANGUAGE_CHANGE,
  COMPOSE_LANGUAGE_ADD,
  COMPOSE_LANGUAGE_DELETE,
  COMPOSE_ADD_SUGGESTED_LANGUAGE,
  COMPOSE_UPLOAD_CHANGE_REQUEST,
  COMPOSE_UPLOAD_CHANGE_SUCCESS,
  COMPOSE_UPLOAD_CHANGE_FAIL,
  COMPOSE_RESET,
  COMPOSE_POLL_ADD,
  COMPOSE_POLL_REMOVE,
  COMPOSE_SCHEDULE_ADD,
  COMPOSE_SCHEDULE_SET,
  COMPOSE_SCHEDULE_REMOVE,
  COMPOSE_POLL_OPTION_ADD,
  COMPOSE_POLL_OPTION_CHANGE,
  COMPOSE_POLL_OPTION_REMOVE,
  COMPOSE_POLL_SETTINGS_CHANGE,
  COMPOSE_ADD_TO_MENTIONS,
  COMPOSE_REMOVE_FROM_MENTIONS,
  COMPOSE_SET_STATUS,
  COMPOSE_EVENT_REPLY,
  COMPOSE_EDITOR_STATE_SET,
  COMPOSE_CHANGE_MEDIA_ORDER,
  COMPOSE_ADD_SUGGESTED_QUOTE,
  COMPOSE_FEDERATED_CHANGE,
  type ComposeAction,
  type ComposeSuggestionSelectAction,
} from '../actions/compose';
import { EVENT_COMPOSE_CANCEL, EVENT_FORM_SET, type EventsAction } from '../actions/events';
import { ME_FETCH_SUCCESS, ME_PATCH_SUCCESS, type MeAction } from '../actions/me';
import { FE_NAME } from '../actions/settings';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';
import { unescapeHTML } from '../utils/html';

import type { Emoji } from 'pl-fe/features/emoji';
import type { Language } from 'pl-fe/features/preferences';
import type { Account } from 'pl-fe/normalizers/account';
import type { Status } from 'pl-fe/normalizers/status';

const getResetFileKey = () => Math.floor((Math.random() * 0x10000));

interface ComposePoll {
  options: Array<string>;
  options_map: Array<Partial<Record<Language, string>>>;
  expires_in: number;
  multiple: boolean;
  hide_totals: boolean;
}

const newPoll = (params: Partial<ComposePoll> = {}): ComposePoll => ({
  options: ['', ''],
  options_map: [{}, {}],
  expires_in: 24 * 3600,
  multiple: false,
  hide_totals: false,
  ...params,
});

interface Compose {
  caretPosition: number | null;
  content_type: string;
  draft_id: string | null;
  editorState: string | null;
  editorStateMap: Partial<Record<Language, string | null>>;
  focusDate: Date | null;
  group_id: string | null;
  idempotencyKey: string;
  id: string | null;
  in_reply_to: string | null;
  is_changing_upload: boolean;
  is_composing: boolean;
  is_submitting: boolean;
  is_uploading: boolean;
  media_attachments: Array<MediaAttachment>;
  poll: ComposePoll | null;
  privacy: string;
  progress: number;
  quote: string | null;
  resetFileKey: number | null;
  schedule: Date | null;
  sensitive: boolean;
  spoiler_text: string;
  spoilerTextMap: Partial<Record<Language, string>>;
  suggestions: Array<string> | Array<Emoji>;
  suggestion_token: string | null;
  tagHistory: Array<string>;
  text: string;
  textMap: Partial<Record<Language, string>>;
  to: Array<string>;
  parent_reblogged_by: string | null;
  dismissed_quotes: Array<string>;
  language: Language | null;
  modified_language: Language | null;
  suggested_language: string | null;
  federated: boolean;
  approvalRequired: boolean;
}

const newCompose = (params: Partial<Compose> = {}): Compose => ({
  caretPosition: null,
  content_type: 'text/plain',
  draft_id: null,
  editorState: null,
  editorStateMap: {},
  focusDate: null,
  group_id: null,
  idempotencyKey: '',
  id: null,
  in_reply_to: null,
  is_changing_upload: false,
  is_composing: false,
  is_submitting: false,
  is_uploading: false,
  media_attachments: [],
  poll: null,
  privacy: 'public',
  progress: 0,
  quote: null,
  resetFileKey: null,
  schedule: null,
  sensitive: false,
  spoiler_text: '',
  spoilerTextMap: {},
  suggestions: [],
  suggestion_token: null,
  tagHistory: [],
  text: '',
  textMap: {},
  to: [],
  parent_reblogged_by: null,
  dismissed_quotes: [],
  language: null,
  modified_language: null,
  suggested_language: null,
  federated: true,
  approvalRequired: false,
  ...params,
});

type State = {
  default: Compose;
  [key: string]: Compose;
};

const statusToTextMentions = (status: Pick<Status, 'account' | 'mentions'>, account: Pick<Account, 'acct'>) => {
  const author = status.account.acct;
  const mentions = status.mentions.map((m) => m.acct) || [];

  return [...new Set([author, ...mentions]
    .filter(acct => acct !== account.acct))]
    .map(m => `@${m} `)
    .join('');
};

const statusToMentionsArray = (status: Pick<Status, 'account' | 'mentions'>, account: Pick<Account, 'acct'>, rebloggedBy?: Pick<Account, 'acct'>) => {
  const author = status.account.acct;
  const mentions = status.mentions.map((m) => m.acct) || [];

  return [...new Set([author, ...(rebloggedBy ? [rebloggedBy.acct] : []), ...mentions].filter(acct => acct !== account.acct))];
};

const statusToMentionsAccountIdsArray = (status: Pick<Status, 'mentions' | 'account'>, account: Pick<Account, 'id'>, parentRebloggedBy?: string | null) => {
  const mentions = status.mentions.map((m) => m.id);

  return [...new Set([status.account.id, ...(parentRebloggedBy ? [parentRebloggedBy] : []), ...mentions].filter((id) => id !== account.id))];
};

const appendMedia = (compose: Compose, media: MediaAttachment, defaultSensitive?: boolean) => {
  const prevSize = compose.media_attachments.length;

  compose.media_attachments.push(media);
  compose.is_uploading = false;
  compose.resetFileKey = Math.floor((Math.random() * 0x10000));
  compose.idempotencyKey = crypto.randomUUID();

  if (prevSize === 0 && (defaultSensitive || compose.sensitive)) {
    compose.sensitive = true;
  }
};

const removeMedia = (compose: Compose, mediaId: string) => {
  const prevSize = compose.media_attachments.length;

  compose.media_attachments = compose.media_attachments.filter(item => item.id !== mediaId);
  compose.idempotencyKey = crypto.randomUUID();

  if (prevSize === 1) {
    compose.sensitive = false;
  }
};

const insertSuggestion = (compose: Compose, position: number, token: string | null, completion: string, path: ComposeSuggestionSelectAction['path']) => {
  const updateText = (oldText?: string) => `${oldText?.slice(0, position)}${completion} ${oldText?.slice(position + (token?.length ?? 0))}`;
  if (path[0] === 'spoiler_text') {
    compose.spoiler_text = updateText(compose.spoiler_text);
  } else if (compose.poll) {
    compose.poll.options[path[2]] = updateText(compose.poll.options[path[2]]);
  }
  compose.suggestion_token = null;
  compose.suggestions = [];
  compose.idempotencyKey = crypto.randomUUID();
};

const updateSuggestionTags = (compose: Compose, token: string, tags: Tag[]) => {
  const prefix = token.slice(1);

  compose.suggestions = tags
    .filter((tag) => tag.name.toLowerCase().startsWith(prefix.toLowerCase()))
    .slice(0, 4)
    .map((tag) => '#' + tag.name);
  compose.suggestion_token = token;
};

const privacyPreference = (a: string, b: string) => {
  const order = ['public', 'unlisted', 'mutuals_only', 'private', 'direct', 'local'];

  if (a === 'group') return a;

  return order[Math.max(order.indexOf(a), order.indexOf(b), 0)];
};

const domParser = new DOMParser();

const expandMentions = (status: Pick<Status, 'content' | 'mentions'>) => {
  const fragment = domParser.parseFromString(status.content, 'text/html').documentElement;

  status.mentions.forEach((mention) => {
    const node = fragment.querySelector(`a[href="${mention.url}"]`);
    if (node) node.textContent = `@${mention.acct}`;
  });

  return fragment.innerHTML;
};

const getExplicitMentions = (me: string, status: Pick<Status, 'content' | 'mentions'>) => {
  const fragment = domParser.parseFromString(status.content, 'text/html').documentElement;

  const mentions = status
    .mentions
    .filter((mention) => !(fragment.querySelector(`a[href="${mention.url}"]`) || mention.id === me))
    .map((m) => m.acct);

  return [...new Set(mentions)];
};

const importAccount = (compose: Compose, account: CredentialAccount) => {
  const settings = account.settings_store?.[FE_NAME];

  if (!settings) return;

  if (settings.defaultPrivacy) compose.privacy = settings.defaultPrivacy;
  if (settings.defaultContentType) compose.content_type = settings.defaultContentType;
  compose.tagHistory = tagHistory.get(account.id);
};

// const updateSetting = (compose: Compose, path: string[], value: string) => {
//   const pathString = path.join(',');
//   switch (pathString) {
//     case 'defaultPrivacy':
//       return compose.set('privacy', value);
//     case 'defaultContentType':
//       return compose.set('content_type', value);
//     default:
//       return compose;
//   }
// };

const updateDefaultContentType = (compose: Compose, instance: Instance) => {
  const postFormats = instance.pleroma.metadata.post_formats;

  compose.content_type = postFormats.includes(compose.content_type) ? compose.content_type : postFormats.includes('text/markdown') ? 'text/markdown' : postFormats[0];
};

const updateCompose = (state: State, key: string, updater: (compose: Compose) => void) =>
  create(state, draft => {
    draft[key] = draft[key] || create(draft.default, () => {});
    updater(draft[key]);
  });
  // state.update(key, state.get('default')!, updater);

const initialState: State = {
  default: newCompose({ idempotencyKey: crypto.randomUUID(), resetFileKey: getResetFileKey() }),
};

const compose = (state = initialState, action: ComposeAction | EventsAction | InstanceAction | MeAction | TimelineAction): State => {
  switch (action.type) {
    case COMPOSE_TYPE_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.content_type = action.value;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_SPOILERNESS_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.sensitive = !compose.sensitive;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_SPOILER_TEXT_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.modified_language || compose.modified_language === compose.language) {
          compose.spoiler_text = action.text;
        } else if (compose.modified_language) {
          compose.spoilerTextMap[compose.modified_language] = action.text;
        }
      });
    case COMPOSE_VISIBILITY_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.privacy = action.value;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_LANGUAGE_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.language = action.value;
        compose.modified_language = action.value;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_MODIFIED_LANGUAGE_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.modified_language = action.value;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.text = action.text;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_REPLY:
      return updateCompose(state, action.composeId, compose => {
        const defaultCompose = state.default!;

        const to = action.explicitAddressing
          ? statusToMentionsArray(action.status, action.account, action.rebloggedBy)
          : [];

        compose.group_id = action.status.group_id;
        compose.in_reply_to = action.status.id;
        compose.to = to;
        compose.parent_reblogged_by = action.rebloggedBy?.id || null;
        compose.text = !action.explicitAddressing ? statusToTextMentions(action.status, action.account) : '';
        compose.privacy = privacyPreference(action.status.visibility, defaultCompose.privacy);
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
        compose.content_type = defaultCompose.content_type;
        compose.approvalRequired = action.approvalRequired || false;
        if (action.preserveSpoilers && action.status.spoiler_text) {
          compose.sensitive = true;
          compose.spoiler_text = action.status.spoiler_text;
        }
      });
    case COMPOSE_EVENT_REPLY:
      return updateCompose(state, action.composeId, compose => {
        compose.in_reply_to = action.status.id;
        compose.to = statusToMentionsArray(action.status, action.account);
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_QUOTE:
      return updateCompose(state, 'compose-modal', compose => {
        const author = action.status.account.acct;
        const defaultCompose = state.default;

        compose.quote = action.status.id;
        compose.to = [author];
        compose.parent_reblogged_by = null;
        compose.text = '';
        compose.privacy = privacyPreference(action.status.visibility, defaultCompose.privacy);
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
        compose.content_type = defaultCompose.content_type;
        compose.spoiler_text = '';

        if (action.status.visibility === 'group') {
          compose.group_id = action.status.group_id;
          compose.privacy = 'group';
        }
      });
    case COMPOSE_SUBMIT_REQUEST:
      return updateCompose(state, action.composeId, compose => {
        compose.is_submitting = true;
      });
    case COMPOSE_UPLOAD_CHANGE_REQUEST:
      return updateCompose(state, action.composeId, compose => {
        compose.is_changing_upload = true;
      });
    case COMPOSE_REPLY_CANCEL:
    case COMPOSE_RESET:
    case COMPOSE_SUBMIT_SUCCESS:
      return create(state, (draft) => {
        draft[action.composeId] = newCompose({
          idempotencyKey: crypto.randomUUID(),
          in_reply_to: action.composeId.startsWith('reply:') ? action.composeId.slice(6) : null,
          ...(action.composeId.startsWith('group:') ? {
            privacy: 'group',
            group_id: action.composeId.slice(6),
          } : undefined),
        });
      });
    case COMPOSE_SUBMIT_FAIL:
      return updateCompose(state, action.composeId, compose => {
        compose.is_submitting = false;
      });
    case COMPOSE_UPLOAD_CHANGE_FAIL:
      return updateCompose(state, action.composeId, compose => {
        compose.is_changing_upload = false;
      });
    case COMPOSE_UPLOAD_REQUEST:
      return updateCompose(state, action.composeId, compose => {
        compose.is_uploading = true;
      });
    case COMPOSE_UPLOAD_SUCCESS:
      return updateCompose(state, action.composeId, compose => appendMedia(compose, action.media, state.default.sensitive));
    case COMPOSE_UPLOAD_FAIL:
      return updateCompose(state, action.composeId, compose => {
        compose.is_uploading = false;
      });
    case COMPOSE_UPLOAD_UNDO:
      return updateCompose(state, action.composeId, compose => removeMedia(compose, action.mediaId));
    case COMPOSE_UPLOAD_PROGRESS:
      return updateCompose(state, action.composeId, compose => {
        compose.progress = Math.round((action.loaded / action.total) * 100);
      });
    case COMPOSE_MENTION:
      return updateCompose(state, 'compose-modal', compose => {
        compose.text = [compose.text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' ');
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_DIRECT:
      return updateCompose(state, 'compose-modal', compose => {
        compose.text = [compose.text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' ');
        compose.privacy = 'direct';
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_GROUP_POST:
      return updateCompose(state, action.composeId, compose => {
        compose.privacy = 'group';
        compose.group_id = action.groupId;
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_SUGGESTIONS_CLEAR:
      return updateCompose(state, action.composeId, compose => {
        compose.suggestions = [];
        compose.suggestion_token = null;
      });
    case COMPOSE_SUGGESTIONS_READY:
      return updateCompose(state, action.composeId, compose => {
        compose.suggestions = action.accounts ? action.accounts.map((item) => item.id) : action.emojis || [];
        compose.suggestion_token = action.token;
      });
    case COMPOSE_SUGGESTION_SELECT:
      return updateCompose(state, action.composeId, compose => insertSuggestion(compose, action.position, action.token, action.completion, action.path));
    case COMPOSE_SUGGESTION_TAGS_UPDATE:
      return updateCompose(state, action.composeId, compose => updateSuggestionTags(compose, action.token, action.tags));
    case COMPOSE_TAG_HISTORY_UPDATE:
      return updateCompose(state, action.composeId, compose => {
        compose.tagHistory = action.tags;
      });
    case TIMELINE_DELETE:
      return updateCompose(state, 'compose-modal', compose => {
        if (action.statusId === compose.in_reply_to) {
          compose.in_reply_to = null;
        } if (action.statusId === compose.quote) {
          compose.quote = null;
        }
      });
    case COMPOSE_UPLOAD_CHANGE_SUCCESS:
      return updateCompose(state, action.composeId, compose => {
        compose.is_changing_upload = false;

        compose.media_attachments = compose.media_attachments.map(item => {
          if (item.id === action.media.id) {
            return action.media;
          }

          return item;
        });
      });
    case COMPOSE_SET_STATUS:
      return updateCompose(state, 'compose-modal', compose => {
        const to = action.explicitAddressing ? getExplicitMentions(action.status.account.id, action.status) : [];
        if (!action.withRedraft && !action.draftId) {
          compose.id = action.status.id;
        }
        compose.text = action.rawText || unescapeHTML(expandMentions(action.status));
        compose.to = to;
        compose.parent_reblogged_by = null;
        compose.in_reply_to = action.status.in_reply_to_id;
        compose.privacy = action.status.visibility;
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
        compose.content_type = action.contentType || 'text/plain';
        compose.quote = action.status.quote_id;
        compose.group_id = action.status.group_id;

        compose.media_attachments = action.status.media_attachments;

        if (action.status.spoiler_text.length > 0) {
          compose.spoiler_text = action.status.spoiler_text;
        } else {
          compose.spoiler_text = '';
        }

        if (action.poll) {
          compose.poll = newPoll({
            options: action.poll.options.map(({ title }) => title),
            multiple: action.poll.multiple,
            expires_in: 24 * 3600,
          });
        }

        if (action.draftId) {
          compose.draft_id = action.draftId;
        }

        if (action.editorState) {
          compose.editorState = action.editorState;
        }
      });
    case COMPOSE_POLL_ADD:
      return updateCompose(state, action.composeId, compose => {
        compose.poll = newPoll();
      });
    case COMPOSE_POLL_REMOVE:
      return updateCompose(state, action.composeId, compose => {
        compose.poll = null;
      });
    case COMPOSE_SCHEDULE_ADD:
      return updateCompose(state, action.composeId, compose => {
        compose.schedule = new Date(Date.now() + 10 * 60 * 1000);
      });
    case COMPOSE_SCHEDULE_SET:
      return updateCompose(state, action.composeId, compose => {
        compose.schedule = action.date;
      });
    case COMPOSE_SCHEDULE_REMOVE:
      return updateCompose(state, action.composeId, compose => {
        compose.schedule = null;
      });
    case COMPOSE_POLL_OPTION_ADD:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.poll) return;
        compose.poll.options.push(action.title);
        compose.poll.options_map.push(Object.fromEntries(Object.entries(compose.textMap).map((key) => [key, action.title])));
      });
    case COMPOSE_POLL_OPTION_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.poll) return;
        if (!compose.modified_language || compose.modified_language === compose.language) {
          compose.poll.options[action.index] = action.title;
          if (compose.modified_language) compose.poll.options_map[action.index][compose.modified_language] = action.title;
        }
      });
    case COMPOSE_POLL_OPTION_REMOVE:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.poll) return;
        compose.poll.options = compose.poll.options.filter((_, index) => index !== action.index);
        compose.poll.options_map = compose.poll.options_map.filter((_, index) => index !== action.index);
      });
    case COMPOSE_POLL_SETTINGS_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.poll) return null;
        if (action.expiresIn) {
          compose.poll.expires_in = action.expiresIn;
        }
        if (typeof action.isMultiple === 'boolean') {
          compose.poll.multiple = action.isMultiple;
        }
      });
    case COMPOSE_ADD_TO_MENTIONS:
      return updateCompose(state, action.composeId, compose => {
        compose.to = [...new Set([...compose.to, action.account])];
      });
    case COMPOSE_REMOVE_FROM_MENTIONS:
      return updateCompose(state, action.composeId, compose => {
        compose.to = compose.to.filter(acct => acct !== action.account);
      });
    case ME_FETCH_SUCCESS:
    case ME_PATCH_SUCCESS:
      return updateCompose(state, 'default', compose => importAccount(compose, action.me));
    // case SETTING_CHANGE:
    //   return updateCompose(state, 'default', compose => updateSetting(compose, action.path, action.value));
    case COMPOSE_EDITOR_STATE_SET:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.modified_language || compose.modified_language === compose.language) {
          compose.editorState = action.editorState as string;
          compose.text = action.text as string;
        } else if (compose.modified_language) {
          compose.editorStateMap[compose.modified_language] = action.editorState as string;
          compose.textMap[compose.modified_language] = action.text as string;
        }
      });
    case EVENT_COMPOSE_CANCEL:
      return updateCompose(state, 'event-compose-modal', compose => {
        compose.text = '';
      });
    case EVENT_FORM_SET:
      return updateCompose(state, action.composeId, compose => {
        compose.text = action.text;
      });
    case COMPOSE_CHANGE_MEDIA_ORDER:
      return updateCompose(state, action.composeId, compose => {
        const indexA = compose.media_attachments.findIndex(x => x.id === action.a);
        const indexB = compose.media_attachments.findIndex(x => x.id === action.b);

        const item = compose.media_attachments.splice(indexA, 1)[0];
        compose.media_attachments.splice(indexB, 0, item);
      });
    case COMPOSE_ADD_SUGGESTED_QUOTE:
      return updateCompose(state, action.composeId, compose => {
        compose.quote = action.quoteId;
      });
    case COMPOSE_ADD_SUGGESTED_LANGUAGE:
      return updateCompose(state, action.composeId, compose => {
        compose.suggested_language = action.language;
      });
    case COMPOSE_LANGUAGE_ADD:
      return updateCompose(state, action.composeId, compose => {
        compose.editorStateMap[action.value] = compose.editorState;
        compose.textMap[action.value] = compose.text;
        compose.spoilerTextMap[action.value] = compose.spoiler_text;
        if (compose.poll) compose.poll.options_map.forEach((option, key) => option[action.value] = compose.poll!.options[key]);
      });
    case COMPOSE_LANGUAGE_DELETE:
      return updateCompose(state, action.composeId, compose => {
        delete compose.editorStateMap[action.value];
        delete compose.textMap[action.value];
        delete compose.spoilerTextMap[action.value];
      });
    case COMPOSE_QUOTE_CANCEL:
      return updateCompose(state, action.composeId, (compose) => {
        if (compose.quote) compose.dismissed_quotes.push(compose.quote);
        compose.quote = null;
      });
    case COMPOSE_FEDERATED_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.federated = !compose.federated;
      });
    case INSTANCE_FETCH_SUCCESS:
      return updateCompose(state, 'default', (compose) => updateDefaultContentType(compose, action.instance));
    default:
      return state;
  }
};

export {
  type Compose,
  statusToMentionsAccountIdsArray,
  initialState,
  compose as default,
};
