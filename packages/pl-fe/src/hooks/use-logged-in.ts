import { useAppSelector } from './use-app-selector';

const useLoggedIn = () => {
  const me = useAppSelector(state => state.me);

  return {
    isLoggedIn: typeof me === 'string',
    isLoginLoading: me === null,
    isLoginFailed: me === false,
    me,
  };
};

export { useLoggedIn };
