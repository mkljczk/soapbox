import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'intersection-observer';
import ResizeObserver from 'resize-observer-polyfill';

// Needed by @tanstack/virtual, I guess
if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver;
}
