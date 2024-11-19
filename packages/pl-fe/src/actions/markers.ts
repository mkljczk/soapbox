import { getClient } from '../api';

import type { Markers, SaveMarkersParams } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const MARKER_FETCH_REQUEST = 'MARKER_FETCH_REQUEST' as const;
const MARKER_FETCH_SUCCESS = 'MARKER_FETCH_SUCCESS' as const;
const MARKER_FETCH_FAIL = 'MARKER_FETCH_FAIL' as const;

const MARKER_SAVE_REQUEST = 'MARKER_SAVE_REQUEST' as const;
const MARKER_SAVE_SUCCESS = 'MARKER_SAVE_SUCCESS' as const;
const MARKER_SAVE_FAIL = 'MARKER_SAVE_FAIL' as const;

const fetchMarker = (timeline: Array<string>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<MarkersAction>({ type: MARKER_FETCH_REQUEST });
    return getClient(getState).timelines.getMarkers(timeline).then((marker) => {
      dispatch<MarkersAction>({ type: MARKER_FETCH_SUCCESS, marker });
    }).catch(error => {
      dispatch<MarkersAction>({ type: MARKER_FETCH_FAIL, error });
    });
  };

const saveMarker = (marker: SaveMarkersParams) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch<MarkersAction>({ type: MARKER_SAVE_REQUEST, marker });
    return getClient(getState).timelines.saveMarkers(marker).then((marker) => {
      dispatch<MarkersAction>({ type: MARKER_SAVE_SUCCESS, marker });
    }).catch(error => {
      dispatch<MarkersAction>({ type: MARKER_SAVE_FAIL, error });
    });
  };

type MarkersAction =
  | {
    type: typeof MARKER_FETCH_REQUEST;
  }
  | {
    type: typeof MARKER_FETCH_SUCCESS;
    marker: Markers;
  }
  | {
    type: typeof MARKER_FETCH_FAIL;
    error: unknown;
  }
  | {
    type: typeof MARKER_SAVE_REQUEST;
    marker: SaveMarkersParams;
  }
  | {
    type: typeof MARKER_SAVE_SUCCESS;
    marker: Markers;
  }
  | {
    type: typeof MARKER_SAVE_FAIL;
    error: unknown;
  }

export {
  MARKER_FETCH_REQUEST,
  MARKER_FETCH_SUCCESS,
  MARKER_FETCH_FAIL,
  MARKER_SAVE_REQUEST,
  MARKER_SAVE_SUCCESS,
  MARKER_SAVE_FAIL,
  fetchMarker,
  saveMarker,
  type MarkersAction,
};
