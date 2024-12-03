import { INSTANCE_FETCH_FAIL, type InstanceAction } from 'pl-fe/actions/instance';

const initialState = {
  /** Whether /api/v1/instance 404'd (and we should display the external auth form). */
  instance_fetch_failed: false,
};

const meta = (state = initialState, action: InstanceAction): typeof initialState => {
  switch (action.type) {
    case INSTANCE_FETCH_FAIL:
      if ((action.error as any)?.response?.status === 404) {
        return { instance_fetch_failed: true };
      }
      return state;
    default:
      return state;
  }
};

export { meta as default };
