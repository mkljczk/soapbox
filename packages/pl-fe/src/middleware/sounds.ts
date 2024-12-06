import { play, soundCache } from 'pl-fe/utils/sounds';

import type { Sounds } from 'pl-fe/utils/sounds';
import type { AnyAction, Middleware } from 'redux';

interface Action extends AnyAction {
  meta: {
    sound: Sounds;
  };
}

/** Middleware to play sounds in response to certain Redux actions. */
const soundsMiddleware = (): Middleware => () => next => anyAction => {
  const action = anyAction as Action;
  if (action.meta?.sound && soundCache[action.meta.sound]) {
    play(soundCache[action.meta.sound]);
  }

  return next(action);
};

export {
  soundsMiddleware as default,
};
