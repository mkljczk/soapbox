import { getClient } from '../api';

import type { CreatePushNotificationsSubscriptionParams, UpdatePushNotificationsSubscriptionParams } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const createPushSubscription = (params: CreatePushNotificationsSubscriptionParams) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).pushNotifications.createSubscription(params);

const updatePushSubscription = (params: UpdatePushNotificationsSubscriptionParams) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).pushNotifications.updateSubscription(params);

export {
  createPushSubscription,
  updatePushSubscription,
};
