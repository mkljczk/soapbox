import { create } from 'mutative';

import { SET_BROWSER_SUPPORT, SET_SUBSCRIPTION, CLEAR_SUBSCRIPTION } from '../actions/push-notifications/setter';

import type { SetterAction } from 'pl-fe/actions/push-notifications/setter';

interface Subscription {
  id: string;
  endpoint: string;
}

interface State {
  subscription: Subscription | null;
  alerts: Record<string, boolean>;
  isSubscribed: boolean;
  browserSupport: boolean;
}

const initialState: State = {
  subscription: null,
  alerts: {
    follow: true,
    follow_request: true,
    favourite: true,
    reblog: true,
    mention: true,
    poll: true,
  },
  isSubscribed: false,
  browserSupport: false,
};

const push_subscriptions = (state = initialState, action: SetterAction): State => {
  switch (action.type) {
    case SET_SUBSCRIPTION:
      return create(state, (draft) => {
        draft.subscription = {
          id: action.subscription.id,
          endpoint: action.subscription.endpoint,
        };
        draft.alerts = action.subscription.alerts;
        draft.isSubscribed = true;
      });
    case SET_BROWSER_SUPPORT:
      return create(state, (draft) => {
        draft.browserSupport = action.value;
      });
    case CLEAR_SUBSCRIPTION:
      return initialState;
    default:
      return state;
  }
};

export { push_subscriptions as default };
