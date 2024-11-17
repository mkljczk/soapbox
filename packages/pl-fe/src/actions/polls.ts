import { getClient } from '../api';

import { importEntities } from './importer';

import type { Poll } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const POLL_VOTE_REQUEST = 'POLL_VOTE_REQUEST' as const;
const POLL_VOTE_SUCCESS = 'POLL_VOTE_SUCCESS' as const;
const POLL_VOTE_FAIL = 'POLL_VOTE_FAIL' as const;

const POLL_FETCH_REQUEST = 'POLL_FETCH_REQUEST' as const;
const POLL_FETCH_SUCCESS = 'POLL_FETCH_SUCCESS' as const;
const POLL_FETCH_FAIL = 'POLL_FETCH_FAIL' as const;

const vote = (pollId: string, choices: number[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(voteRequest());

    return getClient(getState()).polls.vote(pollId, choices).then((data) => {
      dispatch(importEntities({ polls: [data] }));
      dispatch(voteSuccess(data));
    }).catch(err => dispatch(voteFail(err)));
  };

const fetchPoll = (pollId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchPollRequest());

    return getClient(getState()).polls.getPoll(pollId).then((data) => {
      dispatch(importEntities({ polls: [data] }));
      dispatch(fetchPollSuccess(data));
    }).catch(err => dispatch(fetchPollFail(err)));
  };

const voteRequest = () => ({
  type: POLL_VOTE_REQUEST,
});

const voteSuccess = (poll: Poll) => ({
  type: POLL_VOTE_SUCCESS,
  poll,
});

const voteFail = (error: unknown) => ({
  type: POLL_VOTE_FAIL,
  error,
});

const fetchPollRequest = () => ({
  type: POLL_FETCH_REQUEST,
});

const fetchPollSuccess = (poll: Poll) => ({
  type: POLL_FETCH_SUCCESS,
  poll,
});

const fetchPollFail = (error: unknown) => ({
  type: POLL_FETCH_FAIL,
  error,
});

type PollsAction =
  | ReturnType<typeof voteRequest>
  | ReturnType<typeof voteSuccess>
  | ReturnType<typeof voteFail>
  | ReturnType<typeof fetchPollRequest>
  | ReturnType<typeof fetchPollSuccess>
  | ReturnType<typeof fetchPollFail>;

export {
  POLL_VOTE_REQUEST,
  POLL_VOTE_SUCCESS,
  POLL_VOTE_FAIL,
  POLL_FETCH_REQUEST,
  POLL_FETCH_SUCCESS,
  POLL_FETCH_FAIL,
  vote,
  fetchPoll,
  type PollsAction,
};
