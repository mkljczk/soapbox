import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from 'pl-fe/components/ui/icon';

interface IAltIndicator extends Pick<React.HTMLAttributes<HTMLSpanElement>, 'title' | 'className'> {
  warning?: boolean;
}

const AltIndicator: React.FC<IAltIndicator> = ({ className, warning, ...props }) => (
  <span
    className={clsx('inline-flex items-center gap-1 rounded bg-gray-900 px-2 py-1 text-xs font-medium uppercase text-white', className)}
    {...props}
  >
    {warning && <Icon className='size-4' src={require('@tabler/icons/outline/alert-triangle.svg')} />}
    <FormattedMessage id='upload_form.description_missing.indicator' defaultMessage='Alt' />
  </span>
);

export default AltIndicator;
