import { GroupRoles, type Group } from 'pl-api';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Text from 'pl-fe/components/ui/text';

interface IGroupRelationship {
  group: Pick<Group, 'relationship'>;
}

const GroupRelationship = ({ group }: IGroupRelationship) => {
  const isOwner = group.relationship?.role === GroupRoles.OWNER;
  const isAdmin = group.relationship?.role === GroupRoles.ADMIN;

  if (!isOwner && !isAdmin) {
    return null;
  }

  return (
    <HStack
      space={1}
      alignItems='center'
      data-testid='group-relationship'
      className='text-primary-600 dark:text-accent-blue'
    >
      <Icon
        className='size-4'
        src={
          isOwner
            ? require('@tabler/icons/outline/users.svg')
            : require('@tabler/icons/outline/gavel.svg')
        }
      />

      <Text tag='span' weight='medium' size='sm' theme='inherit'>
        {isOwner
          ? <FormattedMessage id='group.role.owner' defaultMessage='Owner' />
          : <FormattedMessage id='group.role.admin' defaultMessage='Admin' />}
      </Text>
    </HStack>
  );
};

export { GroupRelationship as default };
