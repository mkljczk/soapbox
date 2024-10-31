import { useDispatch } from 'react-redux';

import type { AppDispatch } from 'pl-fe/store';

const useAppDispatch = () => useDispatch<AppDispatch>();

export { useAppDispatch };
