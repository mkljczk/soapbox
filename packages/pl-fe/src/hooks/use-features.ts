import { Features } from 'pl-api';

import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';

import { useAppSelector } from './use-app-selector';

/** Get features for the current instance. */
const useFeatures = (): Features => {
  useInstance();
  const features = useAppSelector(state => state.auth.client.features);

  return features;
};

export { useFeatures };
