import { create } from 'mutative';

import { STATUS_IMPORT, STATUSES_IMPORT, type ImporterAction } from 'pl-fe/actions/importer';

import { ACCOUNT_BLOCK_SUCCESS, ACCOUNT_MUTE_SUCCESS, type AccountsAction } from '../actions/accounts';
import {
  CONTEXT_FETCH_SUCCESS,
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_SUCCESS,
  type StatusesAction,
} from '../actions/statuses';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';

import type { Status } from 'pl-api';

interface State {
  inReplyTos: Record<string, string>;
  replies: Record<string, Array<string>>;
}

const initialState: State = {
  inReplyTos: {},
  replies: {},
};

/** Import a single status into the reducer, setting replies and replyTos. */
const importStatus = (state: State, status: Pick<Status, 'id' | 'in_reply_to_id'>, idempotencyKey?: string) => {
  const { id, in_reply_to_id: inReplyToId } = status;
  if (!inReplyToId) return;

  const replies = state.replies[inReplyToId] || [];
  const newReplies = [...new Set([...replies, id])].toSorted();

  state.replies[inReplyToId] = newReplies;
  state.inReplyTos[id] = inReplyToId;

  if (idempotencyKey) {
    deletePendingStatus(state, status.in_reply_to_id, idempotencyKey);
  }
};

/** Import multiple statuses into the state. */
const importStatuses = (state: State, statuses: Array<Pick<Status, 'id' | 'in_reply_to_id'>>) =>
  statuses.forEach(status => importStatus(state, status));

/** Insert a fake status ID connecting descendant to ancestor. */
const insertTombstone = (state: State, ancestorId: string, descendantId: string) => {
  const tombstoneId = `${descendantId}-tombstone`;

  importStatus(state, { id: tombstoneId, in_reply_to_id: ancestorId });
  importStatus(state, { id: descendantId, in_reply_to_id: tombstoneId });
};

/** Find the highest level status from this statusId. */
const getRootNode = (state: State, statusId: string, initialId = statusId): string => {
  const parent = state.inReplyTos[statusId];

  if (!parent) {
    return statusId;
  } else if (parent === initialId) {
    // Prevent cycles
    return parent;
  } else {
    return getRootNode(state, parent, initialId);
  }
};

/** Route fromId to toId by inserting tombstones. */
const connectNodes = (state: State, fromId: string, toId: string) => {
  const fromRoot = getRootNode(state, fromId);
  const toRoot = getRootNode(state, toId);

  if (fromRoot !== toRoot) {
    return insertTombstone(state, toId, fromId);
  } else {
    return state;
  }
};

/** Import a branch of ancestors or descendants, in relation to statusId. */
const importBranch = (state: State, statuses: Array<Pick<Status, 'id' | 'in_reply_to_id'>>, statusId?: string) =>
  statuses.forEach((status, i) => {
    const prevId = statusId && i === 0 ? statusId : (statuses[i - 1] || {}).id;

    if (status.in_reply_to_id) {
      importStatus(state, status);

      // On Mastodon, in_reply_to_id can refer to an unavailable status,
      // so traverse the tree up and insert a connecting tombstone if needed.
      if (statusId) {
        connectNodes(state, status.id, statusId);
      }
    } else if (prevId) {
      // On Pleroma, in_reply_to_id will be null if the parent is unavailable,
      // so insert the tombstone now.
      insertTombstone(state, prevId, status.id);
    }
  });

/** Import a status's ancestors and descendants. */
const normalizeContext = (
  state: State,
  id: string,
  ancestors: Array<Pick<Status, 'id' | 'in_reply_to_id'>>,
  descendants: Array<Pick<Status, 'id' | 'in_reply_to_id'>>,
) => {
  importBranch(state, ancestors);
  importBranch(state, descendants, id);

  if (ancestors.length > 0 && !state.inReplyTos[id]) {
    insertTombstone(state, ancestors[ancestors.length - 1].id, id);
  }
};

/** Remove a status from the reducer. */
const deleteStatus = (state: State, statusId: string) => {
  // Delete from its parent's tree
  const parentId = state.inReplyTos[statusId];
  if (parentId) {
    const parentReplies = state.replies[parentId] || [];
    const newParentReplies = parentReplies.filter(id => id !== statusId);
    state.replies[parentId] = newParentReplies;
  }

  // Dereference children
  const replies = state.replies[statusId] = [];
  replies.forEach(reply => delete state.inReplyTos[reply]);

  delete state.inReplyTos[statusId];
  delete state.replies[statusId];
};

/** Delete multiple statuses from the reducer. */
const deleteStatuses = (state: State, statusIds: string[]) =>
  statusIds.forEach(statusId => deleteStatus(state, statusId));

/** Delete statuses upon blocking or muting a user. */
const filterContexts = (
  state: State,
  relationship: { id: string },
  /** The entire statuses map from the store. */
  statuses: Record<string, Pick<Status, 'account' | 'id'>>,
) => {
  const ownedStatusIds = Object.values(statuses)
    .filter(status => status.account.id === relationship.id)
    .map(status => status.id);

  deleteStatuses(state, ownedStatusIds);
};

/** Add a fake status ID for a pending status. */
const importPendingStatus = (state: State, inReplyToId: string | null | undefined, idempotencyKey: string) => {
  const id = `末pending-${idempotencyKey}`;
  return importStatus(state, { id, in_reply_to_id: inReplyToId || null });
};

/** Delete a pending status from the reducer. */
const deletePendingStatus = (state: State, inReplyToId: string | null | undefined, idempotencyKey: string) => {
  const id = `末pending-${idempotencyKey}`;

  delete state.inReplyTos[id];

  if (inReplyToId) {
    const replies = state.replies[inReplyToId] || [];
    const newReplies = replies.filter(replyId => replyId !== id).toSorted();
    state.replies[inReplyToId] = newReplies;
  }
};

/** Contexts reducer. Used for building a nested tree structure for threads. */
const replies = (state = initialState, action: AccountsAction | ImporterAction | StatusesAction | TimelineAction): State => {
  switch (action.type) {
    case ACCOUNT_BLOCK_SUCCESS:
    case ACCOUNT_MUTE_SUCCESS:
      return create(state, (draft) => filterContexts(draft, action.relationship, action.statuses));
    case CONTEXT_FETCH_SUCCESS:
      return create(state, (draft) => normalizeContext(draft, action.statusId, action.ancestors, action.descendants));
    case TIMELINE_DELETE:
      return create(state, (draft) => deleteStatuses(draft, [action.statusId]));
    case STATUS_CREATE_REQUEST:
      return create(state, (draft) => importPendingStatus(draft, action.params.in_reply_to_id, action.idempotencyKey));
    case STATUS_CREATE_SUCCESS:
      return create(state, (draft) => deletePendingStatus(draft, 'in_reply_to_id' in action.status ? action.status.in_reply_to_id : null, action.idempotencyKey));
    case STATUS_IMPORT:
      return create(state, (draft) => importStatus(draft, action.status, action.idempotencyKey));
    case STATUSES_IMPORT:
      return create(state, (draft) => importStatuses(draft, action.statuses));
    default:
      return state;
  }
};

export {
  replies as default,
};
