import { getPlFeConfig } from 'pl-fe/actions/pl-fe';

import { useAppSelector } from './use-app-selector';

/** Get the pl-fe config from the store */
const usePlFeConfig = () => useAppSelector((state) => getPlFeConfig(state));

export { usePlFeConfig };
