import { decodeFromMarkup, pleromaDecoder } from './actions/preload';

let initialState: Record<string, any> = {};

try {
  initialState = decodeFromMarkup('initial-results', pleromaDecoder);
} catch (e) {
  //
}

export { initialState };
