import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';

import { useAppSelector } from './use-app-selector';

const useVapidKey = () => {
  const { data: instance } = useInstance();

  return useAppSelector((state) => instance.configuration.vapid.public_key || state.auth.app?.vapid_key);
};

export { useVapidKey };
