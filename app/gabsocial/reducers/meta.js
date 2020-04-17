'use strict';

import { STORE_HYDRATE } from '../actions/store';
import { ME_FETCH_SUCCESS } from 'gabsocial/actions/me';
import { Map as ImmutableMap, fromJS } from 'immutable';

const initialState = ImmutableMap({
  streaming_api_base_url: null,
  access_token: null,
});

export default function meta(state = initialState, action) {
  switch(action.type) {
  case STORE_HYDRATE:
    return state.merge(action.state.get('meta'));
  case ME_FETCH_SUCCESS:
    const me = fromJS(action.me);
    const pleroPrefs = me.get('pleroma').delete('settings_store');
    return state.set('pleroma', pleroPrefs);
  default:
    return state;
  }
};
