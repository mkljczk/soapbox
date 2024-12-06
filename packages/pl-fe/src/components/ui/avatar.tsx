import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import StillImage, { IStillImage } from 'pl-fe/components/still-image';

import Icon from './icon';

const AVATAR_SIZE = 42;

const messages = defineMessages({
  avatar: { id: 'account.avatar.alt', defaultMessage: 'Avatar' },
});

interface IAvatar extends Pick<IStillImage, 'alt' | 'src' | 'onError' | 'className'> {
  /** Width and height of the avatar in pixels. */
  size?: number;
}

/** Round profile avatar for accounts. */
const Avatar = (props: IAvatar) => {
  const intl = useIntl();

  const { alt, src, size = AVATAR_SIZE, className } = props;

  const [isAvatarMissing, setIsAvatarMissing] = useState<boolean>(false);

  const handleLoadFailure = () => setIsAvatarMissing(true);

  const style: React.CSSProperties = React.useMemo(() => ({
    width: size,
    height: size,
  }), [size]);

  if (isAvatarMissing) {
    return (
      <div
        style={{
          width: size,
          height: size,
        }}
        className={clsx('flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-900', className)}
      >
        <Icon
          src={require('@tabler/icons/outline/photo-off.svg')}
          className='size-4 text-gray-500 dark:text-gray-700'
        />
      </div>
    );
  }

  return (
    <StillImage
      className={clsx('rounded-lg', className)}
      style={style}
      src={src}
      alt={alt || intl.formatMessage(messages.avatar)}
      onError={handleLoadFailure}
    />
  );
};

export { Avatar as default };
