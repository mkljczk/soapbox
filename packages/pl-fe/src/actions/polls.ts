import { getClient } from '../api';

import { importEntities } from './importer';

import type { AppDispatch, RootState } from 'pl-fe/store';

const vote = (pollId: string, choices: number[]) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState()).polls.vote(pollId, choices).then((data) => {
      dispatch(importEntities({ polls: [data] }));
    });

const fetchPoll = (pollId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState()).polls.getPoll(pollId).then((data) => {
      dispatch(importEntities({ polls: [data] }));
    });

export {
  vote,
  fetchPoll,
};
