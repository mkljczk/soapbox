import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';

/** Fetch OEmbed information for a status by its URL. */
// https://github.com/mastodon/mastodon/blob/main/app/controllers/api/oembed_controller.rb
// https://github.com/mastodon/mastodon/blob/main/app/serializers/oembed_serializer.rb
const embedQueryOptions = (url: string) => queryOptions({
  queryKey: ['embed', url],
  queryFn: () => getClient().oembed.getOembed(url),
});

export { embedQueryOptions };
