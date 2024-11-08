import { configureStore, Tuple, type AnyAction } from '@reduxjs/toolkit';
import { thunk, type ThunkDispatch } from 'redux-thunk';

import errorsMiddleware from './middleware/errors';
import soundsMiddleware from './middleware/sounds';
import appReducer from './reducers';

const store = configureStore({
  reducer: appReducer,
  middleware: () => new Tuple(
    thunk,
    errorsMiddleware(),
    soundsMiddleware(),
  ),
  devTools: true,
});

type Store = typeof store;

// Infer the `RootState` and `AppDispatch` types from the store itself
// https://redux.js.org/usage/usage-with-typescript
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = ThunkDispatch<RootState, {}, AnyAction>;

export {
  store,
  type Store,
  type RootState,
  type AppDispatch,
};
