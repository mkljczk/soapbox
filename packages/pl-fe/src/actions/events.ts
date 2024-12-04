import { defineMessages } from 'react-intl';

import { getClient } from 'pl-fe/api';
import toast from 'pl-fe/toast';

import { importEntities } from './importer';
import { STATUS_FETCH_SOURCE_FAIL, STATUS_FETCH_SOURCE_REQUEST, STATUS_FETCH_SOURCE_SUCCESS } from './statuses';

import type { CreateEventParams, Location, MediaAttachment, PaginatedResponse, Status } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const EVENT_SUBMIT_REQUEST = 'EVENT_SUBMIT_REQUEST' as const;
const EVENT_SUBMIT_SUCCESS = 'EVENT_SUBMIT_SUCCESS' as const;
const EVENT_SUBMIT_FAIL = 'EVENT_SUBMIT_FAIL' as const;

const EVENT_JOIN_REQUEST = 'EVENT_JOIN_REQUEST' as const;
const EVENT_JOIN_SUCCESS = 'EVENT_JOIN_SUCCESS' as const;
const EVENT_JOIN_FAIL = 'EVENT_JOIN_FAIL' as const;

const EVENT_LEAVE_REQUEST = 'EVENT_LEAVE_REQUEST' as const;
const EVENT_LEAVE_SUCCESS = 'EVENT_LEAVE_SUCCESS' as const;
const EVENT_LEAVE_FAIL = 'EVENT_LEAVE_FAIL' as const;

const EVENT_COMPOSE_CANCEL = 'EVENT_COMPOSE_CANCEL' as const;

const EVENT_FORM_SET = 'EVENT_FORM_SET' as const;

const RECENT_EVENTS_FETCH_REQUEST = 'RECENT_EVENTS_FETCH_REQUEST' as const;
const RECENT_EVENTS_FETCH_SUCCESS = 'RECENT_EVENTS_FETCH_SUCCESS' as const;
const RECENT_EVENTS_FETCH_FAIL = 'RECENT_EVENTS_FETCH_FAIL' as const;
const JOINED_EVENTS_FETCH_REQUEST = 'JOINED_EVENTS_FETCH_REQUEST' as const;
const JOINED_EVENTS_FETCH_SUCCESS = 'JOINED_EVENTS_FETCH_SUCCESS' as const;
const JOINED_EVENTS_FETCH_FAIL = 'JOINED_EVENTS_FETCH_FAIL' as const;

const noOp = () => new Promise(f => f(undefined));

const messages = defineMessages({
  exceededImageSizeLimit: { id: 'upload_error.image_size_limit', defaultMessage: 'Image exceeds the current file size limit ({limit})' },
  success: { id: 'compose_event.submit_success', defaultMessage: 'Your event was created' },
  editSuccess: { id: 'compose_event.edit_success', defaultMessage: 'Your event was edited' },
  joinSuccess: { id: 'join_event.success', defaultMessage: 'Joined the event' },
  joinRequestSuccess: { id: 'join_event.request_success', defaultMessage: 'Requested to join the event' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  authorized: { id: 'compose_event.participation_requests.authorize_success', defaultMessage: 'User accepted' },
  rejected: { id: 'compose_event.participation_requests.reject_success', defaultMessage: 'User rejected' },
});

const submitEvent = ({
  statusId,
  name,
  status,
  banner,
  startTime,
  endTime,
  joinMode,
  location,
}: {
  statusId: string | null;
  name: string;
  status: string;
  banner: MediaAttachment | null;
  startTime: Date;
  endTime: Date | null;
  joinMode: 'restricted' | 'free';
  location: Location | null;
}) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    if (!name || !name.length) {
      return;
    }

    dispatch(submitEventRequest());

    const params: CreateEventParams = {
      name,
      status,
      start_time: startTime.toISOString(),
      join_mode: joinMode,
      content_type: 'text/markdown',
    };

    if (endTime) params.end_time = endTime?.toISOString();
    if (banner) params.banner_id = banner.id;
    if (location) params.location_id = location.origin_id;

    return (
      statusId === null
        ? getClient(state).events.createEvent(params)
        : getClient(state).events.editEvent(statusId, params)
    ).then((data) => {
      dispatch(importEntities({ statuses: [data] }));
      dispatch(submitEventSuccess(data));
      toast.success(
        statusId ? messages.editSuccess : messages.success,
        {
          actionLabel: messages.view,
          actionLink: `/@${data.account.acct}/events/${data.id}`,
        },
      );

      return data;
    }).catch((error) => {
      dispatch(submitEventFail(error));
    });
  };

const submitEventRequest = () => ({
  type: EVENT_SUBMIT_REQUEST,
});

const submitEventSuccess = (status: Status) => ({
  type: EVENT_SUBMIT_SUCCESS,
  status,
});

const submitEventFail = (error: unknown) => ({
  type: EVENT_SUBMIT_FAIL,
  error,
});

const joinEvent = (statusId: string, participationMessage?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const status = getState().statuses[statusId];

    if (!status || !status.event || status.event.join_state) {
      return dispatch(noOp);
    }

    dispatch(joinEventRequest(status.id));

    return getClient(getState).events.joinEvent(statusId, participationMessage).then((data) => {
      dispatch(importEntities({ statuses: [data] }));
      dispatch(joinEventSuccess(status.id));
      toast.success(
        data.event?.join_state === 'pending' ? messages.joinRequestSuccess : messages.joinSuccess,
        {
          actionLabel: messages.view,
          actionLink: `/@${data.account.acct}/events/${data.id}`,
        },
      );
    }).catch((error) => {
      dispatch(joinEventFail(error, status.id, status?.event?.join_state || null));
    });
  };

const joinEventRequest = (statusId: string) => ({
  type: EVENT_JOIN_REQUEST,
  statusId,
});

const joinEventSuccess = (statusId: string) => ({
  type: EVENT_JOIN_SUCCESS,
  statusId,
});

const joinEventFail = (error: unknown, statusId: string, previousState: Exclude<Status['event'], null>['join_state'] | null) => ({
  type: EVENT_JOIN_FAIL,
  error,
  statusId,
  previousState,
});

const leaveEvent = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const status = getState().statuses[statusId];

    if (!status || !status.event || !status.event.join_state) {
      return dispatch(noOp);
    }

    dispatch(leaveEventRequest(status.id));

    return getClient(getState).events.leaveEvent(statusId).then((data) => {
      dispatch(importEntities({ statuses: [data] }));
      dispatch(leaveEventSuccess(status.id));
    }).catch((error) => {
      dispatch(leaveEventFail(error, status.id, status?.event?.join_state || null));
    });
  };

const leaveEventRequest = (statusId: string) => ({
  type: EVENT_LEAVE_REQUEST,
  statusId,
});

const leaveEventSuccess = (statusId: string) => ({
  type: EVENT_LEAVE_SUCCESS,
  statusId,
});

const leaveEventFail = (error: unknown, statusId: string, previousState: Exclude<Status['event'], null>['join_state'] | null) => ({
  type: EVENT_LEAVE_FAIL,
  statusId,
  error,
  previousState,
});

const fetchEventIcs = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).events.getEventIcs(statusId);

const cancelEventCompose = () => ({
  type: EVENT_COMPOSE_CANCEL,
});

interface EventFormSetAction {
  type: typeof EVENT_FORM_SET;
  composeId: string;
  text: string;
}

const initEventEdit = (statusId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch({ type: STATUS_FETCH_SOURCE_REQUEST, statusId });

  return getClient(getState()).statuses.getStatusSource(statusId).then(response => {
    dispatch({ type: STATUS_FETCH_SOURCE_SUCCESS, statusId });
    dispatch<EventFormSetAction>({
      type: EVENT_FORM_SET,
      composeId: `compose-event-modal-${statusId}`,
      text: response.text,
    });
    return response;
  }).catch(error => {
    dispatch({ type: STATUS_FETCH_SOURCE_FAIL, statusId, error });
  });
};

const fetchRecentEvents = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists.recent_events?.isLoading) {
      return;
    }

    dispatch<EventsAction>({ type: RECENT_EVENTS_FETCH_REQUEST });

    return getClient(getState()).timelines.publicTimeline({
      only_events: true,
    }).then(response => {
      dispatch(importEntities({ statuses: response.items }));
      dispatch<EventsAction>({
        type: RECENT_EVENTS_FETCH_SUCCESS,
        statuses: response.items,
        next: response.next,
      });
    }).catch(error => {
      dispatch<EventsAction>({ type: RECENT_EVENTS_FETCH_FAIL, error });
    });
  };

const fetchJoinedEvents = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists.joined_events?.isLoading) {
      return;
    }

    dispatch<EventsAction>({ type: JOINED_EVENTS_FETCH_REQUEST });

    getClient(getState).events.getJoinedEvents().then(response => {
      dispatch(importEntities({ statuses: response.items }));
      dispatch<EventsAction>({
        type: JOINED_EVENTS_FETCH_SUCCESS,
        statuses: response.items,
        next: response.next,
      });
    }).catch(error => {
      dispatch<EventsAction>({ type: JOINED_EVENTS_FETCH_FAIL, error });
    });
  };

type EventsAction =
  | ReturnType<typeof submitEventRequest>
  | ReturnType<typeof submitEventSuccess>
  | ReturnType<typeof submitEventFail>
  | ReturnType<typeof joinEventRequest>
  | ReturnType<typeof joinEventSuccess>
  | ReturnType<typeof joinEventFail>
  | ReturnType<typeof leaveEventRequest>
  | ReturnType<typeof leaveEventSuccess>
  | ReturnType<typeof leaveEventFail>
  | ReturnType<typeof cancelEventCompose>
  | EventFormSetAction
  | { type: typeof RECENT_EVENTS_FETCH_REQUEST }
  | { type: typeof RECENT_EVENTS_FETCH_SUCCESS; statuses: Array<Status>; next: (() => Promise<PaginatedResponse<Status>>) | null }
  | { type: typeof RECENT_EVENTS_FETCH_FAIL; error: unknown }
  | { type: typeof JOINED_EVENTS_FETCH_REQUEST }
  | { type: typeof JOINED_EVENTS_FETCH_SUCCESS; statuses: Array<Status>; next: (() => Promise<PaginatedResponse<Status>>) | null }
  | { type: typeof JOINED_EVENTS_FETCH_FAIL; error: unknown }

export {
  EVENT_SUBMIT_REQUEST,
  EVENT_SUBMIT_SUCCESS,
  EVENT_SUBMIT_FAIL,
  EVENT_JOIN_REQUEST,
  EVENT_JOIN_SUCCESS,
  EVENT_JOIN_FAIL,
  EVENT_LEAVE_REQUEST,
  EVENT_LEAVE_SUCCESS,
  EVENT_LEAVE_FAIL,
  EVENT_COMPOSE_CANCEL,
  EVENT_FORM_SET,
  RECENT_EVENTS_FETCH_REQUEST,
  RECENT_EVENTS_FETCH_SUCCESS,
  RECENT_EVENTS_FETCH_FAIL,
  JOINED_EVENTS_FETCH_REQUEST,
  JOINED_EVENTS_FETCH_SUCCESS,
  JOINED_EVENTS_FETCH_FAIL,
  submitEvent,
  joinEvent,
  leaveEvent,
  fetchEventIcs,
  cancelEventCompose,
  initEventEdit,
  fetchRecentEvents,
  fetchJoinedEvents,
  type EventsAction,
};
