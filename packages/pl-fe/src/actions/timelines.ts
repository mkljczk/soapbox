import { getLocale } from 'pl-fe/actions/settings';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { shouldFilter } from 'pl-fe/utils/timelines';

import { getClient } from '../api';

import { importEntities } from './importer';

import type {
  Account as BaseAccount,
  GetAccountStatusesParams,
  GroupTimelineParams,
  HashtagTimelineParams,
  HomeTimelineParams,
  ListTimelineParams,
  PaginatedResponse,
  PublicTimelineParams,
  Status as BaseStatus,
} from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const TIMELINE_UPDATE = 'TIMELINE_UPDATE' as const;
const TIMELINE_DELETE = 'TIMELINE_DELETE' as const;
const TIMELINE_CLEAR = 'TIMELINE_CLEAR' as const;
const TIMELINE_UPDATE_QUEUE = 'TIMELINE_UPDATE_QUEUE' as const;
const TIMELINE_DEQUEUE = 'TIMELINE_DEQUEUE' as const;
const TIMELINE_SCROLL_TOP = 'TIMELINE_SCROLL_TOP' as const;

const TIMELINE_EXPAND_REQUEST = 'TIMELINE_EXPAND_REQUEST' as const;
const TIMELINE_EXPAND_SUCCESS = 'TIMELINE_EXPAND_SUCCESS' as const;
const TIMELINE_EXPAND_FAIL = 'TIMELINE_EXPAND_FAIL' as const;

const MAX_QUEUED_ITEMS = 40;

const processTimelineUpdate = (timeline: string, status: BaseStatus) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const me = getState().me;
    const ownStatus = status.account?.id === me;
    const hasPendingStatuses = !!getState().pending_statuses.length;

    const columnSettings = useSettingsStore.getState().settings.timelines[timeline];
    const shouldSkipQueue = shouldFilter({
      in_reply_to_id: status.in_reply_to_id,
      visibility: status.visibility,
      reblog_id: status.reblog?.id || null,
    }, columnSettings);

    if (ownStatus && hasPendingStatuses) {
      // WebSockets push statuses without the Idempotency-Key,
      // so if we have pending statuses, don't import it from here.
      // We implement optimistic non-blocking statuses.
      return;
    }

    dispatch(importEntities({ statuses: [status] }));

    if (shouldSkipQueue) {
      dispatch(updateTimeline(timeline, status.id));
    } else {
      dispatch(updateTimelineQueue(timeline, status.id));
    }
  };

const updateTimeline = (timeline: string, statusId: string) => ({
  type: TIMELINE_UPDATE,
  timeline,
  statusId,
});

const updateTimelineQueue = (timeline: string, statusId: string) => ({
// if (typeof accept === 'function' && !accept(status)) {
//   return;
// }
  type: TIMELINE_UPDATE_QUEUE,
  timeline,
  statusId,
});

interface TimelineDequeueAction {
  type: typeof TIMELINE_DEQUEUE;
  timeline: string;
}

const dequeueTimeline = (timelineId: string, expandFunc?: (lastStatusId: string) => void) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const queuedCount = state.timelines[timelineId]?.totalQueuedItemsCount || 0;

    if (queuedCount <= 0) return;

    if (queuedCount <= MAX_QUEUED_ITEMS) {
      dispatch<TimelineDequeueAction>({ type: TIMELINE_DEQUEUE, timeline: timelineId });
      return;
    }

    if (typeof expandFunc === 'function') {
      dispatch(clearTimeline(timelineId));
      // @ts-ignore
      expandFunc();
    } else {
      if (timelineId === 'home') {
        dispatch(clearTimeline(timelineId));
        dispatch(fetchHomeTimeline());
      } else if (timelineId === 'public:local') {
        dispatch(clearTimeline(timelineId));
        dispatch(fetchPublicTimeline({ local: true }));
      }
    }
  };

interface TimelineDeleteAction {
  type: typeof TIMELINE_DELETE;
  statusId: string;
  accountId: string;
  references: Array<[string, string]>;
  reblogOf: string | null;
}

const deleteFromTimelines = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const accountId = getState().statuses[statusId]?.account?.id!;
    const references: Array<[string, string]> = Object.entries(getState().statuses)
      .filter(([key, status]) => [key, status.reblog_id === statusId])
      .map(([key, status]) => [key, status.account_id]);
    const reblogOf = getState().statuses[statusId]?.reblog_id || null;

    dispatch<TimelineDeleteAction>({
      type: TIMELINE_DELETE,
      statusId,
      accountId,
      references,
      reblogOf,
    });
  };

const clearTimeline = (timeline: string) => ({ type: TIMELINE_CLEAR, timeline });

const noOp = () => { };

const parseTags = (tags: Record<string, any[]> = {}, mode: 'any' | 'all' | 'none') =>
  (tags[mode] || []).map((tag) => tag.value);

const deduplicateStatuses = (statuses: Array<BaseStatus>) => {
  const deduplicatedStatuses: Array<BaseStatus & { accounts: Array<BaseAccount> }> = [];

  for (const status of statuses) {
    const reblogged = status.reblog && deduplicatedStatuses.find((deduplicatedStatus) => deduplicatedStatus.reblog?.id === status.reblog?.id);

    if (reblogged) {
      reblogged.accounts.push(status.account);
      reblogged.id += ':' + status.id;
    } else if (!deduplicatedStatuses.find((deduplicatedStatus) => deduplicatedStatus.reblog?.id === status.id)) {
      deduplicatedStatuses.push({ accounts: [status.account], ...status });
    }
  }

  return deduplicatedStatuses;
};

const handleTimelineExpand = (timelineId: string, fn: Promise<PaginatedResponse<BaseStatus>>, isLoadingRecent: boolean, done = noOp) =>
  (dispatch: AppDispatch) => {
    dispatch(expandTimelineRequest(timelineId));

    return fn.then(response => {
      dispatch(importEntities({ statuses: response.items }));

      const statuses = deduplicateStatuses(response.items);
      dispatch(importEntities({ statuses: statuses.filter(status => status.accounts) }));

      dispatch(expandTimelineSuccess(
        timelineId,
        statuses,
        response.next,
        response.previous,
        response.partial,
        isLoadingRecent,
      ));
      done();
    }).catch(error => {
      dispatch(expandTimelineFail(timelineId, error));
      done();
    });
  };

const fetchHomeTimeline = (expand = false, done = noOp) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const params: HomeTimelineParams = {};
    if (useSettingsStore.getState().settings.autoTranslate) params.language = getLocale();

    if (expand && state.timelines.home?.isLoading) return;

    const fn = (expand && state.timelines.home?.next?.()) || getClient(state).timelines.homeTimeline(params);

    return dispatch(handleTimelineExpand('home', fn, false, done));
  };

const fetchPublicTimeline = ({ onlyMedia, local, instance }: Record<string, any> = {}, expand = false, done = noOp) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const timelineId = `${instance ? 'remote' : 'public'}${local ? ':local' : ''}${onlyMedia ? ':media' : ''}${instance ? `:${instance}` : ''}`;

    const params: PublicTimelineParams = { only_media: onlyMedia, local: instance ? false : local, instance };
    if (useSettingsStore.getState().settings.autoTranslate) params.language = getLocale();

    if (expand && state.timelines[timelineId]?.isLoading) return;

    const fn = (expand && state.timelines[timelineId]?.next?.()) || getClient(state).timelines.publicTimeline(params);

    return dispatch(handleTimelineExpand(timelineId, fn, false, done));
  };

const fetchBubbleTimeline = ({ onlyMedia }: Record<string, any> = {}, expand = false, done = noOp) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const timelineId = `bubble${onlyMedia ? ':media' : ''}`;

    const params: PublicTimelineParams = { only_media: onlyMedia };
    if (useSettingsStore.getState().settings.autoTranslate) params.language = getLocale();

    if (expand && state.timelines[timelineId]?.isLoading) return;

    const fn = (expand && state.timelines[timelineId]?.next?.()) || getClient(state).timelines.bubbleTimeline(params);

    return dispatch(handleTimelineExpand(timelineId, fn, false, done));
  };

const fetchAccountTimeline = (accountId: string, { exclude_replies, pinned, only_media, limit }: Record<string, any> = {}, expand = false, done = noOp) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const timelineId = `account:${accountId}${!exclude_replies ? ':with_replies' : ''}${pinned ? ':pinned' : only_media ? ':media' : ''}`;

    const params: GetAccountStatusesParams = { exclude_replies, pinned, only_media, limit };
    if (pinned || only_media) params.with_muted = true;
    if (useSettingsStore.getState().settings.autoTranslate) params.language = getLocale();

    if (expand && state.timelines[timelineId]?.isLoading) return;

    const fn = (expand && state.timelines[timelineId]?.next?.()) || getClient(state).accounts.getAccountStatuses(accountId, params);

    return dispatch(handleTimelineExpand(timelineId, fn, false, done));
  };

const fetchListTimeline = (listId: string, expand = false, done = noOp) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const timelineId = `list:${listId}`;

    const params: ListTimelineParams = {};
    if (useSettingsStore.getState().settings.autoTranslate) params.language = getLocale();

    if (expand && state.timelines[timelineId]?.isLoading) return;

    const fn = (expand && state.timelines[timelineId]?.next?.()) || getClient(state).timelines.listTimeline(listId, params);

    return dispatch(handleTimelineExpand(timelineId, fn, false, done));
  };

const fetchGroupTimeline = (groupId: string, { only_media, limit }: Record<string, any> = {}, expand = false, done = noOp) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const timelineId = `group:${groupId}${only_media ? ':media' : ''}`;

    const params: GroupTimelineParams = { only_media, limit };
    if (only_media) params.with_muted = true;
    if (useSettingsStore.getState().settings.autoTranslate) params.language = getLocale();

    if (expand && state.timelines[timelineId]?.isLoading) return;

    const fn = (expand && state.timelines[timelineId]?.next?.()) || getClient(state).timelines.groupTimeline(groupId, params);

    return dispatch(handleTimelineExpand(timelineId, fn, false, done));
  };

const fetchHashtagTimeline = (hashtag: string, { tags }: Record<string, any> = {}, expand = false, done = noOp) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const timelineId = `hashtag:${hashtag}`;

    const params: HashtagTimelineParams = {
      any: parseTags(tags, 'any'),
      all: parseTags(tags, 'all'),
      none: parseTags(tags, 'none'),
    };

    if (expand && state.timelines[timelineId]?.isLoading) return;

    if (useSettingsStore.getState().settings.autoTranslate) params.language = getLocale();

    const fn = (expand && state.timelines[timelineId]?.next?.()) || getClient(state).timelines.hashtagTimeline(hashtag, params);

    return dispatch(handleTimelineExpand(timelineId, fn, false, done));
  };

const expandTimelineRequest = (timeline: string) => ({
  type: TIMELINE_EXPAND_REQUEST,
  timeline,
});

const expandTimelineSuccess = (
  timeline: string,
  statuses: Array<BaseStatus>,
  next: (() => Promise<PaginatedResponse<BaseStatus>>) | null,
  prev: (() => Promise<PaginatedResponse<BaseStatus>>) | null,
  partial: boolean,
  isLoadingRecent: boolean,
) => ({
  type: TIMELINE_EXPAND_SUCCESS,
  timeline,
  statuses,
  next,
  prev,
  partial,
  isLoadingRecent,
});

const expandTimelineFail = (timeline: string, error: unknown) => ({
  type: TIMELINE_EXPAND_FAIL,
  timeline,
  error,
});

const scrollTopTimeline = (timeline: string, top: boolean) => ({
  type: TIMELINE_SCROLL_TOP,
  timeline,
  top,
});

// TODO: other actions
type TimelineAction =
  | ReturnType<typeof updateTimeline>
  | TimelineDeleteAction
  | ReturnType<typeof clearTimeline>
  | ReturnType<typeof updateTimelineQueue>
  | TimelineDequeueAction
  | ReturnType<typeof scrollTopTimeline>
  | ReturnType<typeof expandTimelineRequest>
  | ReturnType<typeof expandTimelineSuccess>
  | ReturnType<typeof expandTimelineFail>;

export {
  TIMELINE_UPDATE,
  TIMELINE_DELETE,
  TIMELINE_CLEAR,
  TIMELINE_UPDATE_QUEUE,
  TIMELINE_DEQUEUE,
  TIMELINE_SCROLL_TOP,
  TIMELINE_EXPAND_REQUEST,
  TIMELINE_EXPAND_SUCCESS,
  TIMELINE_EXPAND_FAIL,
  MAX_QUEUED_ITEMS,
  processTimelineUpdate,
  dequeueTimeline,
  deleteFromTimelines,
  clearTimeline,
  fetchHomeTimeline,
  fetchPublicTimeline,
  fetchBubbleTimeline,
  fetchAccountTimeline,
  fetchListTimeline,
  fetchGroupTimeline,
  fetchHashtagTimeline,
  expandTimelineSuccess,
  scrollTopTimeline,
  type TimelineAction,
};
