import { useFeatures } from './use-features';
import { useInstance } from './use-instance';

const useRegistrationStatus = () => {
  const instance = useInstance();
  const features = useFeatures();

  return {
    /** Registrations are open. */
    isOpen: features.accountCreation && instance.registrations.enabled,
  };
};

export { useRegistrationStatus };
