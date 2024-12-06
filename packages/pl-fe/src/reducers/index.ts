import { combineReducers } from '@reduxjs/toolkit';

import { AUTH_LOGGED_OUT } from 'pl-fe/actions/auth';
import * as BuildConfig from 'pl-fe/build-config';
import entities from 'pl-fe/entity-store/reducer';

import accounts_meta from './accounts-meta';
import admin from './admin';
import admin_user_index from './admin-user-index';
import aliases from './aliases';
import auth from './auth';
import compose from './compose';
import contexts from './contexts';
import conversations from './conversations';
import domain_lists from './domain-lists';
import draft_statuses from './draft-statuses';
import filters from './filters';
import instance from './instance';
import listAdder from './list-adder';
import listEditor from './list-editor';
import lists from './lists';
import me from './me';
import meta from './meta';
import notifications from './notifications';
import onboarding from './onboarding';
import pending_statuses from './pending-statuses';
import plfe from './pl-fe';
import polls from './polls';
import push_notifications from './push-notifications';
import scheduled_statuses from './scheduled-statuses';
import security from './security';
import status_lists from './status-lists';
import statuses from './statuses';
import timelines from './timelines';

const reducers = {
  accounts_meta,
  admin,
  admin_user_index,
  aliases,
  auth,
  compose,
  contexts,
  conversations,
  domain_lists,
  draft_statuses,
  entities,
  filters,
  instance,
  listAdder,
  listEditor,
  lists,
  me,
  meta,
  notifications,
  onboarding,
  pending_statuses,
  plfe,
  polls,
  push_notifications,
  scheduled_statuses,
  security,
  status_lists,
  statuses,
  timelines,
};

const appReducer = combineReducers(reducers);

type AppState = ReturnType<typeof appReducer>;

// Clear the state (mostly) when the user logs out
const logOut = (state: AppState): ReturnType<typeof appReducer> => {
  if (BuildConfig.NODE_ENV === 'production') {
    location.href = '/login';
  }

  const newState = rootReducer(undefined, { type: '' });

  const { instance, plfe, auth } = state;
  return { ...newState, instance, plfe, auth };
};

const rootReducer: typeof appReducer = (state, action) => {
  switch (action.type) {
    case AUTH_LOGGED_OUT:
      return appReducer(logOut(state as AppState), action);
    default:
      return appReducer(state, action);
  }
};

export default appReducer;
