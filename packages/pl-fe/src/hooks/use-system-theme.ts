import { useState, useEffect } from 'react';

type SystemTheme = 'light' | 'black';

/** Get the system color scheme of the system. */
const useSystemTheme = (): SystemTheme => {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const [dark, setDark] = useState(query.matches);

  const handleChange = (event: MediaQueryListEvent) => {
    setDark(event.matches);
  };

  // Older versions of Safari on iOS don't support these events,
  // so try-catch and do nothing.
  useEffect(() => {
    try {
      query.addEventListener('change', handleChange);
    } catch (e) {
      // do nothing
    }

    return () => {
      try {
        query.removeEventListener('change', handleChange);
      } catch (e) {
        // do nothing
      }
    };
  }, []);

  return dark ? 'black' : 'light';
};

export { useSystemTheme };
