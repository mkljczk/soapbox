import type { WebPushSubscription } from 'pl-api';

const SET_BROWSER_SUPPORT = 'PUSH_NOTIFICATIONS_SET_BROWSER_SUPPORT' as const;
const SET_SUBSCRIPTION = 'PUSH_NOTIFICATIONS_SET_SUBSCRIPTION' as const;
const CLEAR_SUBSCRIPTION = 'PUSH_NOTIFICATIONS_CLEAR_SUBSCRIPTION' as const;

const setBrowserSupport = (value: boolean) => ({
  type: SET_BROWSER_SUPPORT,
  value,
});

const setSubscription = (subscription: WebPushSubscription) => ({
  type: SET_SUBSCRIPTION,
  subscription,
});

const clearSubscription = () => ({
  type: CLEAR_SUBSCRIPTION,
});

type SetterAction =
  | ReturnType<typeof setBrowserSupport>
  | ReturnType<typeof setSubscription>
  | ReturnType<typeof clearSubscription>;

export {
  SET_BROWSER_SUPPORT,
  SET_SUBSCRIPTION,
  CLEAR_SUBSCRIPTION,
  setBrowserSupport,
  setSubscription,
  clearSubscription,
  type SetterAction,
};
