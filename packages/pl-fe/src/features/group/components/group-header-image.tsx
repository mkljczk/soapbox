import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from 'pl-fe/components/ui/icon';

import type { Group } from 'pl-fe/normalizers/group';

const messages = defineMessages({
  header: { id: 'group.header.alt', defaultMessage: 'Group header' },
});

interface IGroupHeaderImage {
  group?: Group | false | null;
  className?: string;
}

const GroupHeaderImage: React.FC<IGroupHeaderImage> = ({ className, group }) => {
  const intl = useIntl();

  const [isHeaderMissing, setIsHeaderMissing] = useState<boolean>(false);

  if (!group || !group.header) {
    return null;
  }

  if (isHeaderMissing) {
    return (
      <div
        className={clsx(className, 'flex items-center justify-center bg-gray-200 dark:bg-gray-800/30')}
      >
        <Icon
          src={require('@fluentui/image_off_24_regular.svg')}
          className='size-6 text-gray-500 dark:text-gray-700'
        />
      </div>
    );
  }

  return (
    <img
      className={className}
      src={group.header}
      alt={group.header_description || intl.formatMessage(messages.header)}
      onError={() => setIsHeaderMissing(true)}
    />
  );
};

export { GroupHeaderImage as default };
