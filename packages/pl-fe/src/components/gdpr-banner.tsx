import clsx from 'clsx';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import Banner from 'pl-fe/components/ui/banner';
import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';

const acceptedGdpr = !!localStorage.getItem('plfe:gdpr');

/** Displays a cookie consent banner. */
const GdprBanner: React.FC = () => {
  /** Track whether the banner has already been displayed once. */
  const [shown, setShown] = useState<boolean>(acceptedGdpr);
  const [slideout, setSlideout] = useState(false);

  const { data: instance } = useInstance();
  const { gdprUrl } = usePlFeConfig();

  const handleAccept = () => {
    localStorage.setItem('plfe:gdpr', 'true');
    setSlideout(true);
    setTimeout(() => setShown(true), 200);
  };

  if (shown) {
    return null;
  }

  return (
    <Banner theme='opaque' className={clsx('transition-transform', { 'translate-y-full': slideout })}>
      <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-x-4 lg:space-y-0 rtl:space-x-reverse'>
        <Stack space={2}>
          <Text size='xl' weight='bold'>
            <FormattedMessage id='gdpr.title' defaultMessage='{siteTitle} uses cookies' values={{ siteTitle: instance.title }} />
          </Text>

          <Text weight='medium' className='opacity-60'>
            <FormattedMessage
              id='gdpr.message'
              defaultMessage="{siteTitle} uses session cookies, which are essential to the website's functioning."
              values={{ siteTitle: instance.title }}
            />
          </Text>
        </Stack>

        <HStack space={2} alignItems='center' className='flex-none'>
          {gdprUrl && (
            <a href={gdprUrl} tabIndex={-1} className='inline-flex'>
              <Button theme='secondary'>
                <FormattedMessage id='gdpr.learn_more' defaultMessage='Learn more' />
              </Button>
            </a>
          )}

          <Button theme='accent' onClick={handleAccept}>
            <FormattedMessage id='gdpr.accept' defaultMessage='Accept' />
          </Button>
        </HStack>
      </div>
    </Banner>
  );
};

export { GdprBanner as default };
