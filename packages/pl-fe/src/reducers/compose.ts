import { Map as ImmutableMap, List as ImmutableList, OrderedSet as ImmutableOrderedSet, Record as ImmutableRecord, fromJS } from 'immutable';
import { Instance, PLEROMA, type CredentialAccount, type MediaAttachment, type Tag } from 'pl-api';

import { INSTANCE_FETCH_SUCCESS, InstanceAction } from 'pl-fe/actions/instance';
import { isNativeEmoji } from 'pl-fe/features/emoji';
import { tagHistory } from 'pl-fe/settings';
import { hasIntegerMediaIds } from 'pl-fe/utils/status';

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
  COMPOSE_EMOJI_INSERT,
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
  ComposeAction,
} from '../actions/compose';
import { EVENT_COMPOSE_CANCEL, EVENT_FORM_SET, type EventsAction } from '../actions/events';
import { ME_FETCH_SUCCESS, ME_PATCH_SUCCESS, MeAction } from '../actions/me';
import { FE_NAME } from '../actions/settings';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';
import { unescapeHTML } from '../utils/html';

import type { Emoji } from 'pl-fe/features/emoji';
import type { Language } from 'pl-fe/features/preferences';
import type { Account } from 'pl-fe/normalizers/account';
import type { Status } from 'pl-fe/normalizers/status';

const getResetFileKey = () => Math.floor((Math.random() * 0x10000));

const PollRecord = ImmutableRecord({
  options: ImmutableList(['', '']),
  options_map: ImmutableList<ImmutableMap<Language, string>>([ImmutableMap(), ImmutableMap()]),
  expires_in: 24 * 3600,
  multiple: false,
  hide_totals: false,
});

const ReducerCompose = ImmutableRecord({
  caretPosition: null as number | null,
  content_type: 'text/plain',
  draft_id: null as string | null,
  editorState: null as string | null,
  editorStateMap: ImmutableMap<Language, string | null>(),
  focusDate: null as Date | null,
  group_id: null as string | null,
  idempotencyKey: '',
  id: null as string | null,
  in_reply_to: null as string | null,
  is_changing_upload: false,
  is_composing: false,
  is_submitting: false,
  is_uploading: false,
  media_attachments: ImmutableList<MediaAttachment>(),
  poll: null as Poll | null,
  privacy: 'public',
  progress: 0,
  quote: null as string | null,
  resetFileKey: null as number | null,
  schedule: null as Date | null,
  sensitive: false,
  spoiler_text: '',
  spoilerTextMap: ImmutableMap<Language, string>(),
  suggestions: [] as Array<string | Emoji>,
  suggestion_token: null as string | null,
  tagHistory: ImmutableList<string>(),
  text: '',
  textMap: ImmutableMap<Language, string>(),
  to: ImmutableOrderedSet<string>(),
  parent_reblogged_by: null as string | null,
  dismissed_quotes: ImmutableOrderedSet<string>(),
  language: null as Language | null,
  modified_language: null as Language | null,
  suggested_language: null as string | null,
  federated: true,
  approvalRequired: false,
});

type State = ImmutableMap<string, Compose>;
type Compose = ReturnType<typeof ReducerCompose>;
type Poll = ReturnType<typeof PollRecord>;

const statusToTextMentions = (status: Pick<Status, 'account' | 'mentions'>, account: Pick<Account, 'acct'>) => {
  const author = status.account.acct;
  const mentions = status.mentions.map((m) => m.acct) || [];

  return ImmutableOrderedSet([author])
    .concat(mentions)
    .delete(account.acct)
    .map(m => `@${m} `)
    .join('');
};

const statusToMentionsArray = (status: Pick<Status, 'account' | 'mentions'>, account: Pick<Account, 'acct'>, rebloggedBy?: Pick<Account, 'acct'>) => {
  const author = status.account.acct;
  const mentions = status.mentions.map((m) => m.acct) || [];

  return ImmutableOrderedSet<string>([author])
    .concat(rebloggedBy ? [rebloggedBy.acct] : [])
    .concat(mentions)
    .delete(account.acct);
};

const statusToMentionsAccountIdsArray = (status: Pick<Status, 'mentions' | 'account'>, account: Pick<Account, 'id'>, parentRebloggedBy?: string | null) => {
  const mentions = status.mentions.map((m) => m.id);

  return ImmutableOrderedSet<string>([status.account.id])
    .concat(parentRebloggedBy ? [parentRebloggedBy] : [])
    .concat(mentions)
    .delete(account.id);
};

const appendMedia = (compose: Compose, media: MediaAttachment, defaultSensitive?: boolean) => {
  const prevSize = compose.media_attachments.size;

  return compose.withMutations(map => {
    map.update('media_attachments', list => list.push(media));
    map.set('is_uploading', false);
    map.set('resetFileKey', Math.floor((Math.random() * 0x10000)));
    map.set('idempotencyKey', crypto.randomUUID());

    if (prevSize === 0 && (defaultSensitive || compose.sensitive)) {
      map.set('sensitive', true);
    }
  });
};

const removeMedia = (compose: Compose, mediaId: string) => {
  const prevSize = compose.media_attachments.size;

  return compose.withMutations(map => {
    map.update('media_attachments', list => list.filterNot(item => item.id === mediaId));
    map.set('idempotencyKey', crypto.randomUUID());

    if (prevSize === 1) {
      map.set('sensitive', false);
    }
  });
};

const insertSuggestion = (compose: Compose, position: number, token: string | null, completion: string, path: Array<string | number>) =>
  compose.withMutations(map => {
    map.updateIn(path, oldText => `${(oldText as string).slice(0, position)}${completion} ${(oldText as string).slice(position + (token?.length ?? 0))}`);
    map.set('suggestion_token', null);
    map.set('suggestions', []);
    if (path.length === 1 && path[0] === 'text') {
      map.set('focusDate', new Date());
      map.set('caretPosition', position + completion.length + 1);
    }
    map.set('idempotencyKey', crypto.randomUUID());
  });

const updateSuggestionTags = (compose: Compose, token: string, tags: Tag[]) => {
  const prefix = token.slice(1);

  return compose.merge({
    suggestions: tags
      .filter((tag) => tag.name.toLowerCase().startsWith(prefix.toLowerCase()))
      .slice(0, 4)
      .map((tag) => '#' + tag.name),
    suggestion_token: token,
  });
};

const insertEmoji = (compose: Compose, position: number, emojiData: Emoji, needsSpace: boolean) => {
  const oldText = compose.text;
  const emojiText = isNativeEmoji(emojiData) ? emojiData.native : emojiData.colons;
  const emoji = needsSpace ? ' ' + emojiText : emojiText;

  return compose.merge({
    text: `${oldText.slice(0, position)}${emoji} ${oldText.slice(position)}`,
    focusDate: new Date(),
    caretPosition: position + emoji.length + 1,
    idempotencyKey: crypto.randomUUID(),
  });
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

  return ImmutableOrderedSet<string>(mentions);
};

const importAccount = (compose: Compose, account: CredentialAccount) => {
  const settings = account.settings_store?.[FE_NAME];

  if (!settings) return compose;

  return compose.withMutations(compose => {
    if (settings.defaultPrivacy) compose.set('privacy', settings.defaultPrivacy);
    if (settings.defaultContentType) compose.set('content_type', settings.defaultContentType);
    compose.set('tagHistory', ImmutableList(tagHistory.get(account.id)));
  });
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

  return compose.update('content_type', type => postFormats.includes(type) ? type : postFormats.includes('text/markdown') ? 'text/markdown' : postFormats[0]);
};

const updateCompose = (state: State, key: string, updater: (compose: Compose) => Compose) =>
  state.update(key, state.get('default')!, updater);

const initialState: State = ImmutableMap({
  default: ReducerCompose({ idempotencyKey: crypto.randomUUID(), resetFileKey: getResetFileKey() }),
});

const compose = (state = initialState, action: ComposeAction | EventsAction | InstanceAction | MeAction | TimelineAction) => {
  switch (action.type) {
    case COMPOSE_TYPE_CHANGE:
      return updateCompose(state, action.composeId, compose => compose.withMutations(map => {
        map.set('content_type', action.value);
        map.set('idempotencyKey', crypto.randomUUID());
      }));
    case COMPOSE_SPOILERNESS_CHANGE:
      return updateCompose(state, action.composeId, compose => compose.withMutations(map => {
        map.set('sensitive', !compose.sensitive);
        map.set('idempotencyKey', crypto.randomUUID());
      }));
    case COMPOSE_SPOILER_TEXT_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        return compose
          .setIn(compose.modified_language === compose.language ? ['spoiler_text'] : ['spoilerTextMap', compose.modified_language], action.text)
          .set('idempotencyKey', crypto.randomUUID());
      });
    case COMPOSE_VISIBILITY_CHANGE:
      return updateCompose(state, action.composeId, compose => compose
        .set('privacy', action.value)
        .set('idempotencyKey', crypto.randomUUID()));
    case COMPOSE_LANGUAGE_CHANGE:
      return updateCompose(state, action.composeId, compose => compose.withMutations(map => {
        map.set('language', action.value);
        map.set('modified_language', action.value);
        map.set('idempotencyKey', crypto.randomUUID());
      }));
    case COMPOSE_MODIFIED_LANGUAGE_CHANGE:
      return updateCompose(state, action.composeId, compose => compose.withMutations(map => {
        map.set('modified_language', action.value);
        map.set('idempotencyKey', crypto.randomUUID());
      }));
    case COMPOSE_CHANGE:
      return updateCompose(state, action.composeId, compose => compose
        .set('text', action.text)
        .set('idempotencyKey', crypto.randomUUID()));
    case COMPOSE_REPLY:
      return updateCompose(state, action.composeId, compose => compose.withMutations(map => {
        const defaultCompose = state.get('default')!;

        const to = action.explicitAddressing
          ? statusToMentionsArray(action.status, action.account, action.rebloggedBy)
          : ImmutableOrderedSet<string>();

        map.set('group_id', action.status.group_id);
        map.set('in_reply_to', action.status.id);
        map.set('to', to);
        map.set('parent_reblogged_by', action.rebloggedBy?.id || null);
        map.set('text', !action.explicitAddressing ? statusToTextMentions(action.status, action.account) : '');
        map.set('privacy', privacyPreference(action.status.visibility, defaultCompose.privacy));
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', crypto.randomUUID());
        map.set('content_type', defaultCompose.content_type);
        map.set('approvalRequired', action.approvalRequired || false);
        if (action.preserveSpoilers && action.status.spoiler_text) {
          map.set('sensitive', true);
          map.set('spoiler_text', action.status.spoiler_text);
        }
      }));
    case COMPOSE_EVENT_REPLY:
      return updateCompose(state, action.composeId, compose => compose.withMutations(map => {
        map.set('in_reply_to', action.status.id);
        map.set('to', statusToMentionsArray(action.status, action.account));
        map.set('idempotencyKey', crypto.randomUUID());
      }));
    case COMPOSE_QUOTE:
      return updateCompose(state, 'compose-modal', compose => compose.withMutations(map => {
        const author = action.status.account.acct;
        const defaultCompose = state.get('default')!;

        map.set('quote', action.status.id);
        map.set('to', ImmutableOrderedSet<string>([author]));
        map.set('parent_reblogged_by', null);
        map.set('text', '');
        map.set('privacy', privacyPreference(action.status.visibility, defaultCompose.privacy));
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', crypto.randomUUID());
        map.set('content_type', defaultCompose.content_type);
        map.set('spoiler_text', '');

        if (action.status.visibility === 'group') {
          map.set('group_id', action.status.group_id);
          map.set('privacy', 'group');
        }
      }));
    case COMPOSE_SUBMIT_REQUEST:
      return updateCompose(state, action.composeId, compose => compose.set('is_submitting', true));
    case COMPOSE_UPLOAD_CHANGE_REQUEST:
      return updateCompose(state, action.composeId, compose => compose.set('is_changing_upload', true));
    case COMPOSE_REPLY_CANCEL:
    case COMPOSE_RESET:
    case COMPOSE_SUBMIT_SUCCESS:
      return updateCompose(state, action.composeId, () => state.get('default')!.withMutations(map => {
        map.set('idempotencyKey', crypto.randomUUID());
        map.set('in_reply_to', action.composeId.startsWith('reply:') ? action.composeId.slice(6) : null);
        if (action.composeId.startsWith('group:')) {
          map.set('privacy', 'group');
          map.set('group_id', action.composeId.slice(6));
        }
      }));
    case COMPOSE_SUBMIT_FAIL:
      return updateCompose(state, action.composeId, compose => compose.set('is_submitting', false));
    case COMPOSE_UPLOAD_CHANGE_FAIL:
      return updateCompose(state, action.composeId, compose => compose.set('is_changing_upload', false));
    case COMPOSE_UPLOAD_REQUEST:
      return updateCompose(state, action.composeId, compose => compose.set('is_uploading', true));
    case COMPOSE_UPLOAD_SUCCESS:
      return updateCompose(state, action.composeId, compose => appendMedia(compose, action.media, state.get('default')!.sensitive));
    case COMPOSE_UPLOAD_FAIL:
      return updateCompose(state, action.composeId, compose => compose.set('is_uploading', false));
    case COMPOSE_UPLOAD_UNDO:
      return updateCompose(state, action.composeId, compose => removeMedia(compose, action.mediaId));
    case COMPOSE_UPLOAD_PROGRESS:
      return updateCompose(state, action.composeId, compose => compose.set('progress', Math.round((action.loaded / action.total) * 100)));
    case COMPOSE_MENTION:
      return updateCompose(state, 'compose-modal', compose => compose.withMutations(map => {
        map.update('text', text => [text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' '));
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', crypto.randomUUID());
      }));
    case COMPOSE_DIRECT:
      return updateCompose(state, 'compose-modal', compose => compose.withMutations(map => {
        map.update('text', text => [text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' '));
        map.set('privacy', 'direct');
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', crypto.randomUUID());
      }));
    case COMPOSE_GROUP_POST:
      return updateCompose(state, action.composeId, compose => compose.withMutations(map => {
        map.set('privacy', 'group');
        map.set('group_id', action.groupId);
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', crypto.randomUUID());
      }));
    case COMPOSE_SUGGESTIONS_CLEAR:
      return updateCompose(state, action.composeId, compose => compose.set('suggestions', []).set('suggestion_token', null));
    case COMPOSE_SUGGESTIONS_READY:
      return updateCompose(state, action.composeId, compose => compose.set('suggestions', action.accounts ? action.accounts.map((item) => item.id) : action.emojis || []).set('suggestion_token', action.token));
    case COMPOSE_SUGGESTION_SELECT:
      return updateCompose(state, action.composeId, compose => insertSuggestion(compose, action.position, action.token, action.completion, action.path));
    case COMPOSE_SUGGESTION_TAGS_UPDATE:
      return updateCompose(state, action.composeId, compose => updateSuggestionTags(compose, action.token, action.tags));
    case COMPOSE_TAG_HISTORY_UPDATE:
      return updateCompose(state, action.composeId, compose => compose.set('tagHistory', ImmutableList(fromJS(action.tags)) as ImmutableList<string>));
    case TIMELINE_DELETE:
      return updateCompose(state, 'compose-modal', compose => {
        if (action.statusId === compose.in_reply_to) {
          return compose.set('in_reply_to', null);
        } if (action.statusId === compose.quote) {
          return compose.set('quote', null);
        } else {
          return compose;
        }
      });
    case COMPOSE_EMOJI_INSERT:
      return updateCompose(state, action.composeId, compose => insertEmoji(compose, action.position, action.emoji, action.needsSpace));
    case COMPOSE_UPLOAD_CHANGE_SUCCESS:
      return updateCompose(state, action.composeId, compose => compose
        .set('is_changing_upload', false)
        .update('media_attachments', list => list.map(item => {
          if (item.id === action.media.id) {
            return action.media;
          }

          return item;
        })));
    case COMPOSE_SET_STATUS:
      return updateCompose(state, 'compose-modal', compose => compose.withMutations(map => {
        const to = action.explicitAddressing ? getExplicitMentions(action.status.account.id, action.status) : ImmutableOrderedSet<string>();
        if (!action.withRedraft && !action.draftId) {
          map.set('id', action.status.id);
        }
        map.set('text', action.rawText || unescapeHTML(expandMentions(action.status)));
        map.set('to', to);
        map.set('parent_reblogged_by', null);
        map.set('in_reply_to', action.status.in_reply_to_id);
        map.set('privacy', action.status.visibility);
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', crypto.randomUUID());
        map.set('content_type', action.contentType || 'text/plain');
        map.set('quote', action.status.quote_id);
        map.set('group_id', action.status.group_id);

        if (action.v?.software === PLEROMA && action.withRedraft && hasIntegerMediaIds(action.status)) {
          map.set('media_attachments', ImmutableList());
        } else {
          map.set('media_attachments', ImmutableList(action.status.media_attachments));
        }

        if (action.status.spoiler_text.length > 0) {
          map.set('spoiler_text', action.status.spoiler_text);
        } else {
          map.set('spoiler_text', '');
        }

        if (action.poll) {
          map.set('poll', PollRecord({
            options: ImmutableList(action.poll.options.map(({ title }) => title)),
            multiple: action.poll.multiple,
            expires_in: 24 * 3600,
          }));
        }

        if (action.draftId) {
          map.set('draft_id', action.draftId);
        }

        if (action.editorState) {
          map.set('editorState', action.editorState);
        }
      }));
    case COMPOSE_POLL_ADD:
      return updateCompose(state, action.composeId, compose => compose.set('poll', PollRecord()));
    case COMPOSE_POLL_REMOVE:
      return updateCompose(state, action.composeId, compose => compose.set('poll', null));
    case COMPOSE_SCHEDULE_ADD:
      return updateCompose(state, action.composeId, compose => compose.set('schedule', new Date(Date.now() + 10 * 60 * 1000)));
    case COMPOSE_SCHEDULE_SET:
      return updateCompose(state, action.composeId, compose => compose.set('schedule', action.date));
    case COMPOSE_SCHEDULE_REMOVE:
      return updateCompose(state, action.composeId, compose => compose.set('schedule', null));
    case COMPOSE_POLL_OPTION_ADD:
      return updateCompose(state, action.composeId, compose =>
        compose
          .updateIn(['poll', 'options'], options => (options as ImmutableList<string>).push(action.title))
          .updateIn(['poll', 'options_map'], options_map => (options_map as ImmutableList<ImmutableMap<Language, string>>).push(ImmutableMap(compose.textMap.map(_ => action.title)))),
      );
    case COMPOSE_POLL_OPTION_CHANGE:
      return updateCompose(state, action.composeId, compose =>
        compose.setIn(!compose.modified_language || compose.modified_language === compose.language ? ['poll', 'options', action.index] : ['poll', 'options_map', action.index, compose.modified_language], action.title),
      );
    case COMPOSE_POLL_OPTION_REMOVE:
      return updateCompose(state, action.composeId, compose =>
        compose
          .updateIn(['poll', 'options'], options => (options as ImmutableList<string>).delete(action.index))
          .updateIn(['poll', 'options_map'], options_map => (options_map as ImmutableList<ImmutableMap<Language, string>>).delete(action.index)),
      );
    case COMPOSE_POLL_SETTINGS_CHANGE:
      return updateCompose(state, action.composeId, compose => compose.update('poll', poll => {
        if (!poll) return null;
        return poll.withMutations((poll) => {
          if (action.expiresIn) {
            poll.set('expires_in', action.expiresIn);
          }
          if (typeof action.isMultiple === 'boolean') {
            poll.set('multiple', action.isMultiple);
          }
        });
      }));
    case COMPOSE_ADD_TO_MENTIONS:
      return updateCompose(state, action.composeId, compose => compose.update('to', mentions => mentions!.add(action.account)));
    case COMPOSE_REMOVE_FROM_MENTIONS:
      return updateCompose(state, action.composeId, compose => compose.update('to', mentions => mentions!.delete(action.account)));
    case ME_FETCH_SUCCESS:
    case ME_PATCH_SUCCESS:
      return updateCompose(state, 'default', compose => importAccount(compose, action.me));
    // case SETTING_CHANGE:
    //   return updateCompose(state, 'default', compose => updateSetting(compose, action.path, action.value));
    case COMPOSE_EDITOR_STATE_SET:
      return updateCompose(state, action.composeId, compose => compose
        .setIn(!compose.modified_language || compose.modified_language === compose.language ? ['editorState'] : ['editorStateMap', compose.modified_language], action.editorState as string)
        .setIn(!compose.modified_language || compose.modified_language === compose.language ? ['text'] : ['textMap', compose.modified_language], action.text as string));
    case EVENT_COMPOSE_CANCEL:
      return updateCompose(state, 'event-compose-modal', compose => compose.set('text', ''));
    case EVENT_FORM_SET:
      return updateCompose(state, action.composeId, compose => compose.set('text', action.text));
    case COMPOSE_CHANGE_MEDIA_ORDER:
      return updateCompose(state, action.composeId, compose => compose.update('media_attachments', list => {
        const indexA = list.findIndex(x => x.id === action.a);
        const moveItem = list.get(indexA)!;
        const indexB = list.findIndex(x => x.id === action.b);

        return list.splice(indexA, 1).splice(indexB, 0, moveItem);
      }));
    case COMPOSE_ADD_SUGGESTED_QUOTE:
      return updateCompose(state, action.composeId, compose => compose.set('quote', action.quoteId));
    case COMPOSE_ADD_SUGGESTED_LANGUAGE:
      return updateCompose(state, action.composeId, compose => compose.set('suggested_language', action.language));
    case COMPOSE_LANGUAGE_ADD:
      return updateCompose(state, action.composeId, compose =>
        compose
          .setIn(['editorStateMap', action.value], compose.editorState)
          .setIn(['textMap', action.value], compose.text)
          .setIn(['spoilerTextMap', action.value], compose.spoiler_text)
          .update('poll', poll => {
            if (!poll) return poll;
            return poll.update('options_map', optionsMap => optionsMap.map((option, key) => option.set(action.value, poll.options.get(key)!)));
          }),
      );
    case COMPOSE_LANGUAGE_DELETE:
      return updateCompose(state, action.composeId, compose => compose
        .removeIn(['editorStateMap', action.value])
        .removeIn(['textMap', action.value])
        .removeIn(['spoilerTextMap', action.value]));
    case COMPOSE_QUOTE_CANCEL:
      return updateCompose(state, action.composeId, compose => compose
        .update('dismissed_quotes', quotes => compose.quote ? quotes.add(compose.quote) : quotes)
        .set('quote', null));
    case COMPOSE_FEDERATED_CHANGE:
      return updateCompose(state, action.composeId, compose => compose.update('federated', value => !value));
    case INSTANCE_FETCH_SUCCESS:
      return updateCompose(state, 'default', (compose) => updateDefaultContentType(compose, action.instance));
    default:
      return state;
  }
};

export {
  ReducerCompose,
  statusToMentionsAccountIdsArray,
  initialState,
  compose as default,
};
