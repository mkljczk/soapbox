import React from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Emojify from 'pl-fe/features/emoji/emojify';
import GroupHeaderImage from 'pl-fe/features/group/components/group-header-image';
import GroupMemberCount from 'pl-fe/features/group/components/group-member-count';
import GroupPrivacy from 'pl-fe/features/group/components/group-privacy';
import GroupRelationship from 'pl-fe/features/group/components/group-relationship';

import GroupAvatar from './groups/group-avatar';

import type { Group as GroupEntity } from 'pl-fe/normalizers/group';

interface IGroupCard {
  group: GroupEntity;
}

const GroupCard: React.FC<IGroupCard> = ({ group }) => (
  <Stack
    className='black:bg-black dark:border-primary-800 dark:bg-primary-900 relative h-[240px] rounded-lg border border-solid border-gray-300 bg-white'
    data-testid='group-card'
  >
    {/* Group Cover Image */}
    <Stack grow className='bg-primary-100 relative basis-1/2 rounded-t-lg dark:bg-gray-800'>
      <GroupHeaderImage
        group={group}
        className='absolute inset-0 size-full rounded-t-lg object-cover'
      />
    </Stack>

    {/* Group Avatar */}
    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
      <GroupAvatar group={group} size={64} withRing />
    </div>

    {/* Group Info */}
    <Stack alignItems='center' justifyContent='end' grow className='basis-1/2 py-4' space={0.5}>
      <HStack alignItems='center' space={1.5}>
        <Text size='lg' weight='bold'>
          <Emojify text={group.display_name} emojis={group.emojis} />
        </Text>
      </HStack>

      <HStack className='text-gray-700 dark:text-gray-600' space={2} wrap>
        <GroupRelationship group={group} />
        <GroupPrivacy group={group} />
        <GroupMemberCount group={group} />
      </HStack>
    </Stack>
  </Stack>
);

export { GroupCard as default };
