import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';

import { useFeatures } from './use-features';

const useRegistrationStatus = () => {
  const { data: instance } = useInstance();
  const features = useFeatures();

  return {
    /** Registrations are open. */
    isOpen: features.accountCreation && instance.registrations.enabled,
  };
};

export { useRegistrationStatus };
