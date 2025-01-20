import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';
import { store } from 'pl-fe/store';

const translationLanguagesQueryOptions = queryOptions({
  queryKey: ['translationLanguages'],
  queryFn: async () => {
    const metadata = store.getState().instance.pleroma.metadata;

    if (metadata.translation.source_languages?.length) {
      return Object.fromEntries(metadata.translation.source_languages.map(source => [
        source,
          metadata.translation.target_languages!.filter(lang => lang !== source),
      ]));
    }

    return getClient().instance.getInstanceTranslationLanguages();
  },
  placeholderData: {},
  // enabled: isLoggedIn && features.translations,
});

export { translationLanguagesQueryOptions };
