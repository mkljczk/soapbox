import { getClient } from '../api';

import type { CreatePushNotificationsSubscriptionParams } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const createPushSubscription = (params: CreatePushNotificationsSubscriptionParams) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).pushNotifications.createSubscription(params);

export {
  createPushSubscription,
};
