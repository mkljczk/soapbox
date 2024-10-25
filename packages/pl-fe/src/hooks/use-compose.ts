import { useAppSelector } from './use-app-selector';

import type { ReducerCompose } from 'pl-fe/reducers/compose';

/** Get compose for given key with fallback to 'default' */
const useCompose = <ID extends string>(composeId: ID extends 'default' ? never : ID): ReturnType<typeof ReducerCompose> =>
  useAppSelector((state) => state.compose.get(composeId, state.compose.get('default')!));

export { useCompose };
