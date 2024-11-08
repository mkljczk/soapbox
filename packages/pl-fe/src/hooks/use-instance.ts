import { useAppSelector } from './use-app-selector';

/** Get the Instance for the current backend. */
const useInstance = () => useAppSelector((state) => state.instance);

export { useInstance };
