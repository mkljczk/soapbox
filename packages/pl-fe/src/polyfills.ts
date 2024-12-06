import 'intersection-observer';
import ResizeObserver from 'resize-observer-polyfill';

// Needed by @tanstack/virtual, I guess
if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver;
}
