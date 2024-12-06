import { getClient } from '../api';

import type { Markers, SaveMarkersParams } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const MARKER_FETCH_SUCCESS = 'MARKER_FETCH_SUCCESS' as const;

const MARKER_SAVE_SUCCESS = 'MARKER_SAVE_SUCCESS' as const;

const fetchMarker = (timeline: Array<string>) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).timelines.getMarkers(timeline).then((marker) => {
      dispatch<MarkersAction>({ type: MARKER_FETCH_SUCCESS, marker });
    });

const saveMarker = (marker: SaveMarkersParams) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).timelines.saveMarkers(marker).then((marker) => {
      dispatch<MarkersAction>({ type: MARKER_SAVE_SUCCESS, marker });
    });

type MarkersAction =
  | {
    type: typeof MARKER_FETCH_SUCCESS;
    marker: Markers;
  }
  | {
    type: typeof MARKER_SAVE_SUCCESS;
    marker: Markers;
  };

export {
  MARKER_FETCH_SUCCESS,
  MARKER_SAVE_SUCCESS,
  fetchMarker,
  saveMarker,
  type MarkersAction,
};
