/**
 * globals: do things through the console.
 * This feature is for developers.
 */
import { changeSetting } from 'pl-fe/actions/settings';

import type { Store } from 'pl-fe/store';

/** Add PlFe globals to the window. */
const createGlobals = (store: Store) => {
  const PlFe = {
    /** Become a developer with `plFe.isDeveloper()` */
    isDeveloper: (bool = true): boolean => {
      if (![true, false].includes(bool)) {
        throw `Invalid option ${bool}. Must be true or false.`;
      }
      store.dispatch(changeSetting(['isDeveloper'], bool) as any);
      return bool;
    },
  };

  (window as any).plFe = PlFe;
};

export { createGlobals };
