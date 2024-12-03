import type { AnyAction } from 'redux';

const initialState = {
  /** Whether /api/v1/instance 404'd (and we should display the external auth form). */
  instance_fetch_failed: false,
};

const meta = (state = initialState, action: AnyAction): typeof initialState => state;

export { meta as default };
