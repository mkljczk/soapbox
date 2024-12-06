import clsx from 'clsx';
import { GroupRoles, type Group } from 'pl-api';
import React from 'react';

import Avatar from 'pl-fe/components/ui/avatar';

interface IGroupAvatar {
  group: Pick<Group, 'avatar' | 'avatar_description' | 'relationship'>;
  size: number;
  withRing?: boolean;
}

const GroupAvatar = (props: IGroupAvatar) => {
  const { group, size, withRing = false } = props;

  const isOwner = group.relationship?.role === GroupRoles.OWNER;

  return (
    <Avatar
      className={
        clsx('relative rounded-lg', {
          'shadow-[0_0_0_2px_theme(colors.primary.600),0_0_0_4px_theme(colors.white)]': isOwner && withRing,
          'dark:shadow-[0_0_0_2px_theme(colors.primary.600),0_0_0_4px_theme(colors.gray.800)]': isOwner && withRing,
          'shadow-[0_0_0_2px_theme(colors.primary.600)]': isOwner && !withRing,
          'shadow-[0_0_0_2px_theme(colors.white)] dark:shadow-[0_0_0_2px_theme(colors.gray.800)]': !isOwner && withRing,
        })
      }
      src={group.avatar}
      alt={group.avatar_description}
      size={size}
    />
  );
};

export { GroupAvatar as default };
