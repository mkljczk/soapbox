import { getClient } from 'pl-fe/api';

import { useAppSelector } from './use-app-selector';

const useClient = () => useAppSelector(getClient);

export { useClient };
