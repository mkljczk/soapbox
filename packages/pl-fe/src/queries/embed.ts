import { useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';

type Embed = {
  type: string;
  version: string;
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  cache_age: number;
  html: string;
  width: number | null;
  height: number | null;
}

/** Fetch OEmbed information for a status by its URL. */
// https://github.com/mastodon/mastodon/blob/main/app/controllers/api/oembed_controller.rb
// https://github.com/mastodon/mastodon/blob/main/app/serializers/oembed_serializer.rb
const useEmbed = (url: string) => {
  const client = useClient();

  const getEmbed = async () => {
    const data = await client.oembed.getOembed(url);
    return data;
  };

  return useQuery<Embed>({
    queryKey: ['embed', url],
    queryFn: getEmbed,
  });
};

export { useEmbed as default };
