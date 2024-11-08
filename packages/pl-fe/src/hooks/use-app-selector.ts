import { TypedUseSelectorHook, useSelector } from 'react-redux';

import type { RootState } from 'pl-fe/store';

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { useAppSelector };
