import { useAppSelector } from './use-app-selector';

/** Get the Instance for the current backend. */
const useInstance = () => useAppSelector((state) => {
  (window as any).state = state;
  return state.instance;
});

export { useInstance };
