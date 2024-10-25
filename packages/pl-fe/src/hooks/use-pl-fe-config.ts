import { getPlFeConfig } from 'pl-fe/actions/pl-fe';

import { useAppSelector } from './use-app-selector';

import type { PlFeConfig } from 'pl-fe/types/pl-fe';

/** Get the pl-fe config from the store */
const usePlFeConfig = (): PlFeConfig => useAppSelector((state) => getPlFeConfig(state));

export { usePlFeConfig };
