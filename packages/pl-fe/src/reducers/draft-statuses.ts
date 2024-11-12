import { create } from 'mutative';
import { mediaAttachmentSchema } from 'pl-api';
import * as v from 'valibot';

import { COMPOSE_SUBMIT_SUCCESS, type ComposeAction } from 'pl-fe/actions/compose';
import { DRAFT_STATUSES_FETCH_SUCCESS, PERSIST_DRAFT_STATUS, CANCEL_DRAFT_STATUS, DraftStatusesAction } from 'pl-fe/actions/draft-statuses';
import { filteredArray } from 'pl-fe/schemas/utils';
import KVStore from 'pl-fe/storage/kv-store';

import type { APIEntity } from 'pl-fe/types/entities';

const draftStatusSchema = v.object({
  content_type: v.fallback(v.string(), 'text/plain'),
  draft_id: v.string(),
  editorState: v.fallback(v.nullable(v.string()), null),
  group_id: v.fallback(v.nullable(v.string()), null),
  in_reply_to: v.fallback(v.nullable(v.string()), null),
  media_attachments: filteredArray(mediaAttachmentSchema),
  poll: v.fallback(v.nullable(v.record(v.string(), v.any())), null),
  privacy: v.fallback(v.string(), 'public'),
  quote: v.fallback(v.nullable(v.string()), null),
  schedule: v.fallback(v.nullable(v.string()), null),
  sensitive: v.fallback(v.boolean(), false),
  spoiler: v.fallback(v.boolean(), false),
  spoiler_text: v.fallback(v.string(), ''),
  text: v.fallback(v.string(), ''),
});

type DraftStatus = v.InferOutput<typeof draftStatusSchema>;
type State = Record<string, DraftStatus>;

const initialState: State = {};

const importStatus = (state: State, status: APIEntity) => {
  state[status.draft_id] = v.parse(draftStatusSchema, status);
};

const importStatuses = (state: State, statuses: APIEntity[]) => {
  Object.values(statuses || {}).forEach(status => importStatus(state, status));
};

const deleteStatus = (state: State, statusId: string) => {
  if (statusId) delete state[statusId];
  return state;
};

const persistState = (state: State, accountUrl: string) => {
  KVStore.setItem(`drafts:${accountUrl}`, state);
  return state;
};

const scheduled_statuses = (state: State = initialState, action: DraftStatusesAction | ComposeAction) => {
  switch (action.type) {
    case DRAFT_STATUSES_FETCH_SUCCESS:
      return create(state, (draft) => importStatuses(draft, action.statuses));
    case PERSIST_DRAFT_STATUS:
      return persistState(create(state, (draft) => importStatus(draft, action.status)), action.accountUrl);
    case CANCEL_DRAFT_STATUS:
      return persistState(create(state, (draft) => deleteStatus(draft, action.statusId)), action.accountUrl);
    case COMPOSE_SUBMIT_SUCCESS:
      return action.draftId ? persistState(create(state, (draft) => deleteStatus(draft, action.draftId!)), action.accountUrl) : state;
    default:
      return state;
  }
};

export {
  type DraftStatus,
  scheduled_statuses as default,
};
