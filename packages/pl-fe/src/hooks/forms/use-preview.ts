import { useMemo } from 'react';

/** Return a preview URL for a file. */
const usePreview = (file: File | null | undefined): string | undefined => useMemo(() => {
  if (file) {
    return URL.createObjectURL(file);
  }
}, [file]);

export { usePreview };
