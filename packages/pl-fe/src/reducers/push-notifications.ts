import { Map as ImmutableMap, Record as ImmutableRecord } from 'immutable';

import { SET_BROWSER_SUPPORT, SET_SUBSCRIPTION, CLEAR_SUBSCRIPTION } from '../actions/push-notifications';

import type { SetterAction } from 'pl-fe/actions/push-notifications/setter';

const SubscriptionRecord = ImmutableRecord({
  id: '',
  endpoint: '',
});

const ReducerRecord = ImmutableRecord({
  subscription: null as Subscription | null,
  alerts: ImmutableMap<string, boolean>({
    follow: true,
    follow_request: true,
    favourite: true,
    reblog: true,
    mention: true,
    poll: true,
  }),
  isSubscribed: false,
  browserSupport: false,
});

type Subscription = ReturnType<typeof SubscriptionRecord>;

const push_subscriptions = (state = ReducerRecord(), action: SetterAction) => {
  switch (action.type) {
    case SET_SUBSCRIPTION:
      return state
        .set('subscription', SubscriptionRecord({
          id: action.subscription.id,
          endpoint: action.subscription.endpoint,
        }))
        .set('alerts', ImmutableMap(action.subscription.alerts))
        .set('isSubscribed', true);
    case SET_BROWSER_SUPPORT:
      return state.set('browserSupport', action.value);
    case CLEAR_SUBSCRIPTION:
      return ReducerRecord();
    default:
      return state;
  }
};

export { push_subscriptions as default };
