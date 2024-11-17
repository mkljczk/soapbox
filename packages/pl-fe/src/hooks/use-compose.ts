import { useAppSelector } from './use-app-selector';

import type { Compose } from 'pl-fe/reducers/compose';

/** Get compose for given key with fallback to 'default' */
const useCompose = <ID extends string>(composeId: ID extends 'default' ? never : ID): Compose =>
  useAppSelector((state) => state.compose[composeId] || state.compose.default);

export { useCompose };
