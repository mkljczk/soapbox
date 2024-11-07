import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from '@tanstack/react-router';

import GroupAvatar from 'pl-fe/components/groups/group-avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Emojify from 'pl-fe/features/emoji/emojify';
import GroupActionButton from 'pl-fe/features/group/components/group-action-button';
import { shortNumberFormat } from 'pl-fe/utils/numbers';

import type { Group } from 'pl-fe/normalizers/group';

interface IGroupListItem {
  group: Pick<Group, 'id' | 'avatar' | 'avatar_description' | 'display_name' | 'emojis' | 'locked' | 'members_count' | 'relationship'>;
  withJoinAction?: boolean;
}

const GroupListItem = (props: IGroupListItem) => {
  const { group, withJoinAction = true } = props;

  return (
    <HStack
      alignItems='center'
      justifyContent='between'
      data-testid='group-list-item'
    >
      <Link key={group.id} to={`/groups/${group.id}`} className='overflow-hidden'>
        <HStack alignItems='center' space={2}>
          <GroupAvatar
            group={group}
            size={44}
          />

          <Stack className='overflow-hidden'>
            <Text weight='bold' truncate>
              <Emojify text={group.display_name} emojis={group.emojis} />
            </Text>

            <HStack className='text-gray-700 dark:text-gray-600' space={1} alignItems='center'>
              <Icon
                className='size-4.5'
                src={group.locked ? require('@tabler/icons/outline/lock.svg') : require('@tabler/icons/outline/world.svg')}
              />

              <Text theme='inherit' tag='span' size='sm' weight='medium'>
                {group.locked ? (
                  <FormattedMessage id='group.privacy.locked' defaultMessage='Private' />
                ) : (
                  <FormattedMessage id='group.privacy.public' defaultMessage='Public' />
                )}
              </Text>

              {typeof group.members_count !== 'undefined' && (
                <>
                  <span>&bull;</span>
                  <Text theme='inherit' tag='span' size='sm' weight='medium'>
                    {shortNumberFormat(group.members_count)}
                    {' '}
                    <FormattedMessage
                      id='groups.discover.search.results.member_count'
                      defaultMessage='{members, plural, one {member} other {members}}'
                      values={{
                        members: group.members_count,
                      }}
                    />
                  </Text>
                </>
              )}
            </HStack>
          </Stack>
        </HStack>
      </Link>

      {withJoinAction && (
        <GroupActionButton group={group} />
      )}
    </HStack>
  );
};

export { GroupListItem as default };
