import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { useAboutPage } from 'pl-fe/api/hooks/pl-fe/use-about-page';
import { Navlinks } from 'pl-fe/components/navlinks';
import Card from 'pl-fe/components/ui/card';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';
import { useSettings } from 'pl-fe/hooks/use-settings';

import { languages } from '../preferences';

/** Displays arbitrary user-uploaded HTML on a page at `/about/:slug` */
const AboutPage: React.FC = () => {
  const { slug = 'index' } = useParams<{ slug?: string }>();

  const settings = useSettings();
  const plFeConfig = usePlFeConfig();

  const [locale, setLocale] = useState<string>(settings.locale);

  const { aboutPages } = plFeConfig;

  const page = aboutPages[slug];
  const defaultLocale = page?.defaultLocale;
  const pageLocales = page?.locales || [];
  const fetchLocale = Boolean(page && locale !== defaultLocale && pageLocales.includes(locale));

  const { data: pageHtml } = useAboutPage(slug, fetchLocale ? locale : undefined);

  const alsoAvailable = (defaultLocale) && (
    <div>
      <FormattedMessage id='about.also_available' defaultMessage='Available in:' />
      {' '}
      <ul className='inline list-none p-0'>
        <li className="inline after:content-['_·_']">
          <a href='#' onClick={() => setLocale(defaultLocale)}>
            {/* @ts-ignore */}
            {languages[defaultLocale] || defaultLocale}
          </a>
        </li>
        {
          pageLocales?.map(locale => (
            <li className="inline after:content-['_·_'] last:after:content-none" key={locale}>
              <a href='#' onClick={() => setLocale(locale)}>
                {/* @ts-ignore */}
                {languages[locale] || locale}
              </a>
            </li>
          ))
        }
      </ul>
    </div>
  );

  return (
    <div>
      <Card variant='rounded'>
        <div className='prose mx-auto py-4 dark:prose-invert sm:p-6'>
          {pageHtml && <div dangerouslySetInnerHTML={{ __html: pageHtml }} />}
          {alsoAvailable}
        </div>
      </Card>

      <Navlinks type='homeFooter' />
    </div>
  );
};

export { AboutPage as default };
