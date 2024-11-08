import { Record as ImmutableRecord } from 'immutable';

import { INSTANCE_FETCH_FAIL, type InstanceAction } from 'pl-fe/actions/instance';

const ReducerRecord = ImmutableRecord({
  /** Whether /api/v1/instance 404'd (and we should display the external auth form). */
  instance_fetch_failed: false,
});

const meta = (state = ReducerRecord(), action: InstanceAction) => {
  switch (action.type) {
    case INSTANCE_FETCH_FAIL:
      if (action.error?.response?.status === 404) {
        return state.set('instance_fetch_failed', true);
      }
      return state;
    default:
      return state;
  }
};

export { meta as default };
