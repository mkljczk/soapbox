import { Features } from 'pl-api';

import { useAppSelector } from './use-app-selector';
import { useInstance } from './use-instance';

/** Get features for the current instance. */
const useFeatures = (): Features => {
  useInstance();
  const features = useAppSelector(state => state.auth.client.features);

  return features;
};

export { useFeatures };
