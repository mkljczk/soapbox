import { queryOptions } from '@tanstack/react-query';

import { staticFetch } from 'pl-fe/api';

const fetchAboutPage = async (slug: string, locale?: string) => {
  const filename = `${slug}${locale ? `.${locale}` : ''}.html`;

  const { data } = await staticFetch(`/instance/about/${filename}`);

  return data;
};

const aboutPageQueryOptions = (slug = 'index', locale?: string) => queryOptions({
  queryKey: ['pl-fe', 'aboutPages', slug, locale],
  queryFn: () => fetchAboutPage(slug, locale),
});

export { aboutPageQueryOptions };
