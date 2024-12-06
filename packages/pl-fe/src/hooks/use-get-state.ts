import { useAppDispatch } from './use-app-dispatch';

import type { RootState } from 'pl-fe/store';

/**
 * Provides a `getState()` function to hooks.
 * You should prefer `useAppSelector` when possible.
 */
const useGetState = () => {
  const dispatch = useAppDispatch();
  return () => dispatch((_, getState: () => RootState) => getState());
};

export { useGetState };
