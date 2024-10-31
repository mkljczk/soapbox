import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useLogo } from 'pl-fe/hooks/use-logo';

const messages = defineMessages({
  logo: { id: 'generic.logo', defaultMessage: 'Logo' },
});

interface ISiteLogo extends React.ComponentProps<'img'> {
  /** Extra class names for the <img> element. */
  className?: string;
  /** Override theme setting for <SitePreview /> */
  theme?: 'dark' | 'light';
}

/** Display the most appropriate site logo based on the theme and configuration. */
const SiteLogo: React.FC<ISiteLogo> = ({ className, theme, ...rest }) => {
  const intl = useIntl();
  const logoSrc = useLogo();

  if (!logoSrc) return null;

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      alt={intl.formatMessage(messages.logo)}
      className={clsx('object-contain', className)}
      src={logoSrc}
      {...rest}
    />
  );
};

export { SiteLogo as default };
