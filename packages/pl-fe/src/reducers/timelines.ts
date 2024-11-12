import sample from 'lodash/sample';
import { create } from 'mutative';

import { ACCOUNT_BLOCK_SUCCESS, ACCOUNT_MUTE_SUCCESS, type AccountsAction } from '../actions/accounts';
import { PIN_SUCCESS, UNPIN_SUCCESS, type InteractionsAction } from '../actions/interactions';
import { STATUS_CREATE_REQUEST, STATUS_CREATE_SUCCESS, type StatusesAction } from '../actions/statuses';
import {
  TIMELINE_UPDATE,
  TIMELINE_DELETE,
  TIMELINE_CLEAR,
  TIMELINE_EXPAND_SUCCESS,
  TIMELINE_EXPAND_REQUEST,
  TIMELINE_EXPAND_FAIL,
  TIMELINE_UPDATE_QUEUE,
  TIMELINE_DEQUEUE,
  MAX_QUEUED_ITEMS,
  TIMELINE_SCROLL_TOP,
  TIMELINE_INSERT,
  type TimelineAction,
} from '../actions/timelines';

import type { PaginatedResponse, Status as BaseStatus, Relationship } from 'pl-api';
import type { ImportPosition } from 'pl-fe/entity-store/types';
import type { Status } from 'pl-fe/normalizers/status';
import type { AnyAction } from 'redux';

const TRUNCATE_LIMIT = 40;
const TRUNCATE_SIZE = 20;

interface Timeline {
  unread: number;
  top: boolean;
  isLoading: boolean;
  hasMore: boolean;
  next: (() => Promise<PaginatedResponse<BaseStatus>>) | null;
  prev: (() => Promise<PaginatedResponse<BaseStatus>>) | null;
  items: Array<string>;
  queuedItems: Array<string>; //max= MAX_QUEUED_ITEMS
  totalQueuedItemsCount: number; //used for queuedItems overflow for MAX_QUEUED_ITEMS+
  loadingFailed: boolean;
  isPartial: boolean;
}

const newTimeline = (): Timeline => ({
  unread: 0,
  top: true,
  isLoading: false,
  hasMore: true,
  next: null,
  prev: null,
  items: [],
  queuedItems: [], //max= MAX_QUEUED_ITEMS
  totalQueuedItemsCount: 0, //used for queuedItems overflow for MAX_QUEUED_ITEMS+
  loadingFailed: false,
  isPartial: false,
});

const initialState: State = {};

type State = Record<string, Timeline>;

const getStatusIds = (statuses: Array<Pick<BaseStatus, 'id'>> = []) => statuses.map(status => status.id);

const mergeStatusIds = (oldIds: Array<string>, newIds: Array<string>) => [...new Set([...newIds, ...oldIds])];

const addStatusId = (oldIds = Array<string>(), newId: string) => (
  mergeStatusIds(oldIds, [newId])
);

// Like `take`, but only if the collection's size exceeds truncateLimit
const truncate = (items: Array<string>, truncateLimit: number, newSize: number) => (
  items.length > truncateLimit ? items.slice(0, newSize) : items
);

const truncateIds = (items: Array<string>) => truncate(items, TRUNCATE_LIMIT, TRUNCATE_SIZE);

const updateTimeline = (state: State, timelineId: string, updater: (timeline: Timeline) => void) => {
  state[timelineId] = state[timelineId] || newTimeline();
  updater(state[timelineId]);
};

const setLoading = (state: State, timelineId: string, loading: boolean) =>
  updateTimeline(state, timelineId, (timeline) => {
    timeline.isLoading = loading;
  });

// Keep track of when a timeline failed to load
const setFailed = (state: State, timelineId: string, failed: boolean) =>
  updateTimeline(state, timelineId, (timeline) => {
    timeline.loadingFailed = failed;
  });

const expandNormalizedTimeline = (
  state: State,
  timelineId: string,
  statuses: Array<BaseStatus>,
  next: (() => Promise<PaginatedResponse<BaseStatus>>) | null,
  prev: (() => Promise<PaginatedResponse<BaseStatus>>) | null,
  isPartial: boolean,
  isLoadingRecent: boolean,
  pos: ImportPosition = 'end',
) => {
  const newIds = getStatusIds(statuses);

  updateTimeline(state, timelineId, (timeline) => {
    timeline.isLoading = false;
    timeline.loadingFailed = false;
    timeline.isPartial = isPartial;
    timeline.next = next;
    timeline.prev = prev;

    if (!next && !isLoadingRecent) timeline.hasMore = false;

    // Pinned timelines can be replaced entirely
    if (timelineId.endsWith(':pinned')) {
      timeline.items = newIds;
      return;
    }

    if (newIds.length) {
      if (pos === 'end') {
        timeline.items = mergeStatusIds(newIds, timeline.items);
      } else {
        timeline.items = mergeStatusIds(timeline.items, newIds);
      }
    }
  });
};

const appendStatus = (state: State, timelineId: string, statusId: string) => {
  const top = state[timelineId]?.top;
  const oldIds = state[timelineId]?.items || [];
  const unread = state[timelineId]?.unread || 0;

  if (oldIds.includes(statusId)) return state;

  const newIds = addStatusId(oldIds, statusId);

  updateTimeline(state, timelineId, (timeline) => {
    if (top) {
      // For performance, truncate items if user is scrolled to the top
      timeline.items = truncateIds(newIds);
    } else {
      timeline.unread = unread + 1;
      timeline.items = newIds;
    }
  });
};

const updateTimelineQueue = (state: State, timelineId: string, statusId: string) => {
  updateTimeline(state, timelineId, (timeline) => {
    const { queuedItems: queuedIds, items: listedIds, totalQueuedItemsCount: queuedCount } = timeline;

    if (queuedIds.includes(statusId)) return;
    if (listedIds.includes(statusId)) return;

    timeline.totalQueuedItemsCount = queuedCount + 1;
    timeline.queuedItems = addStatusId(queuedIds, statusId).slice(0, MAX_QUEUED_ITEMS);
  });
};

const shouldDelete = (timelineId: string, excludeAccount?: string) => {
  if (!excludeAccount) return true;
  if (timelineId === `account:${excludeAccount}`) return false;
  if (timelineId.startsWith(`account:${excludeAccount}:`)) return false;
  return true;
};

const deleteStatus = (state: State, statusId: string, references: Array<string>, excludeAccount?: string) => {
  for (const timelineId in state) {
    if (shouldDelete(timelineId, excludeAccount)) {
      state[timelineId].items = state[timelineId].items.filter(id => id !== statusId);
      state[timelineId].queuedItems = state[timelineId].queuedItems.filter(id => id !== statusId);
    }
  }

  // Remove reblogs of deleted status
  references.forEach(ref => {
    deleteStatus(state, ref, [], excludeAccount);
  });
};

const clearTimeline = (state: State, timelineId: string) => {
  state[timelineId] = newTimeline();
};

const updateTop = (state: State, timelineId: string, top: boolean) =>
  updateTimeline(state, timelineId, (timeline) => {
    if (top) timeline.unread = 0;
    timeline.top = top;
  });

const isReblogOf = (reblog: Pick<Status, 'reblog_id'>, status: Pick<Status, 'id'>) => reblog.reblog_id === status.id;

const buildReferencesTo = (
  statuses: Record<string, Pick<Status, 'id' | 'account' | 'reblog_id'>>,
  status: Pick<Status, 'id'>,
) => (
  Object.values(statuses)
    .filter(reblog => isReblogOf(reblog, status))
    .map(status => status.id)
);

// const filterTimeline = (state: State, timelineId: string, relationship: APIEntity, statuses: ImmutableList<ImmutableMap<string, any>>) =>
//   state.updateIn([timelineId, 'items'], ImmutableOrderedSet(), (ids) =>
//     (ids as ImmutableOrderedSet<string>).filterNot(statusId =>
//       statuses.getIn([statusId, 'account']) === relationship.id,
//     ));

const filterTimelines = (state: State, relationship: Relationship, statuses: Record<string, Pick<Status, 'id' | 'account' | 'account_id' | 'reblog_id'>>) => {
  for (const statusId in statuses) {
    const status = statuses[statusId];

    if (status.account_id !== relationship.id) return;
    const references = buildReferencesTo(statuses, status);
    deleteStatus(state, status.id, references, relationship.id);
  }
};

const timelineDequeue = (state: State, timelineId: string) => {
  updateTimeline(state, timelineId, (timeline) => {
    const top = timeline.top;

    const queuedIds = timeline.queuedItems;

    const newIds = mergeStatusIds(timeline.items, queuedIds);
    timeline.items = top ? truncateIds(newIds) : newIds;

    timeline.queuedItems = [];
    timeline.totalQueuedItemsCount = 0;
  });
};

// const timelineDisconnect = (state: State, timelineId: string) =>
//   state.update(timelineId, TimelineRecord(), timeline => timeline.withMutations(timeline => {
//     This is causing problems. Disable for now.
//     https://gitlab.com/soapbox-pub/soapbox/-/issues/716
//     timeline.set('items', addStatusId(items, null));
// }));

const getTimelinesForStatus = (status: Pick<BaseStatus, 'visibility' | 'group'>) => {
  switch (status.visibility) {
    case 'group':
      return [`group:${status.group?.id}`];
    case 'direct':
      return ['direct'];
    case 'public':
      return ['home', 'public:local', 'public', 'bubble'];
    default:
      return ['home'];
  }
};

// Given an OrderedSet of IDs, replace oldId with newId maintaining its position
const replaceId = (ids: Array<string>, oldId: string, newId: string) => {
  const index = ids.indexOf(oldId);

  if (index > -1) {
    ids[index] = newId;
  }
};

const importPendingStatus = (state: State, params: BaseStatus, idempotencyKey: string) => {
  const statusId = `末pending-${idempotencyKey}`;

  const timelineIds = getTimelinesForStatus(params);

  timelineIds.forEach(timelineId => {
    updateTimelineQueue(state, timelineId, statusId);
  });
};

const replacePendingStatus = (state: State, idempotencyKey: string, newId: string) => {
  const oldId = `末pending-${idempotencyKey}`;

  // Loop through timelines and replace the pending status with the real one
  for (const timelineId in state) {
    replaceId(state[timelineId].items, oldId, newId);
    replaceId(state[timelineId].queuedItems, oldId, newId);
  }
};

const importStatus = (state: State, status: BaseStatus, idempotencyKey: string) =>{
  replacePendingStatus(state, idempotencyKey, status.id);

  const timelineIds = getTimelinesForStatus(status);

  timelineIds.forEach(timelineId => {
    appendStatus(state, timelineId, status.id);
  });
};

const handleExpandFail = (state: State, timelineId: string) => {
  setLoading(state, timelineId, false);
  setFailed(state, timelineId, true);
};

const timelines = (state: State = initialState, action: AccountsAction | AnyAction | InteractionsAction | StatusesAction | TimelineAction): State => {
  switch (action.type) {
    case STATUS_CREATE_REQUEST:
      if (action.params.scheduled_at) return state;
      return create(state, (draft) => importPendingStatus(draft, action.params, action.idempotencyKey));
    case STATUS_CREATE_SUCCESS:
      if (action.status.scheduled_at || action.editing) return state;
      return create(state, (draft) => importStatus(draft, action.status, action.idempotencyKey));
    case TIMELINE_EXPAND_REQUEST:
      return create(state, (draft) => setLoading(draft, action.timeline, true));
    case TIMELINE_EXPAND_FAIL:
      return create(state, (draft) => handleExpandFail(draft, action.timeline));
    case TIMELINE_EXPAND_SUCCESS:
      return create(state, (draft) => expandNormalizedTimeline(
        draft,
        action.timeline,
        action.statuses,
        action.next,
        action.prev,
        action.partial,
        action.isLoadingRecent,
      ));
    case TIMELINE_UPDATE:
      return create(state, (draft) => appendStatus(draft, action.timeline, action.statusId));
    case TIMELINE_UPDATE_QUEUE:
      return create(state, (draft) => updateTimelineQueue(draft, action.timeline, action.statusId));
    case TIMELINE_DEQUEUE:
      return create(state, (draft) => timelineDequeue(draft, action.timeline));
    case TIMELINE_DELETE:
      return create(state, (draft) => deleteStatus(draft, action.statusId, action.references, action.reblogOf));
    case TIMELINE_CLEAR:
      return create(state, (draft) => clearTimeline(draft, action.timeline));
    case ACCOUNT_BLOCK_SUCCESS:
    case ACCOUNT_MUTE_SUCCESS:
      return create(state, (draft) => filterTimelines(draft, action.relationship, action.statuses));
    // case ACCOUNT_UNFOLLOW_SUCCESS:
    //   return filterTimeline(state, 'home', action.relationship, action.statuses);
    case TIMELINE_SCROLL_TOP:
      return create(state, (draft) => updateTop(state, action.timeline, action.top));
    case TIMELINE_INSERT:
      return create(state, (draft) => updateTimeline(draft, action.timeline, (timeline) => {
        let oldIdsArray = timeline.items;
        const existingSuggestionId = oldIdsArray.find(key => key.includes('末suggestions'));

        if (existingSuggestionId) {
          oldIdsArray = oldIdsArray.slice(1);
        }
        const positionInTimeline = sample([5, 6, 7, 8, 9]) as number;
        if (timeline.items.at(-1)) {
          oldIdsArray.splice(positionInTimeline, 0, `末suggestions-${timeline.items.at(-1)}`);
        }

        timeline.items = oldIdsArray;
      }));
    case PIN_SUCCESS:
      return create(state, (draft) => updateTimeline(draft, `account:${action.accountId}:with_replies:pinned`, (timeline) => {
        timeline.items = [...new Set([action.statusId, ...timeline.items])];
      }));
    case UNPIN_SUCCESS:
      return create(state, (draft) => updateTimeline(draft, `account:${action.accountId}:with_replies:pinned`, (timeline) => {
        timeline.items = timeline.items.filter((id) => id !== action.statusId);
      }));
    default:
      return state;
  }
};

export { timelines as default };
