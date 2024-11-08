import React from 'react';
import { FormattedMessage } from 'react-intl';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Popover from 'pl-fe/components/ui/popover';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';

import type { Group } from 'pl-fe/normalizers/group';

interface IGroupPolicy {
  group: Pick<Group, 'locked'>;
}

const GroupPrivacy = ({ group }: IGroupPolicy) => (
  <Popover
    referenceElementClassName='cursor-help'
    content={
      <Stack space={4} alignItems='center' className='w-72'>
        <div className='rounded-full bg-gray-200 p-3 dark:bg-gray-800'>
          <Icon
            src={
              group.locked
                ? require('@fluentui/lock_closed_24_regular.svg')
                : require('@fluentui/globe_24_regular.svg')
            }
            className='size-6 text-gray-600 dark:text-gray-600'
          />
        </div>

        <Stack space={1} alignItems='center'>
          <Text size='lg' weight='bold' align='center'>
            {group.locked ? (
              <FormattedMessage id='group.privacy.locked.full' defaultMessage='Private Group' />
            ) : (
              <FormattedMessage id='group.privacy.public.full' defaultMessage='Public Group' />
            )}
          </Text>

          <Text theme='muted' align='center'>
            {group.locked ? (
              <FormattedMessage id='group.privacy.locked.info' defaultMessage='Discoverable. Users can join after their request is approved.' />
            ) : (
              <FormattedMessage id='group.privacy.public.info' defaultMessage='Discoverable. Anyone can join.' />
            )}
          </Text>
        </Stack>
      </Stack>
    }
  >
    <HStack space={1} alignItems='center' data-testid='group-privacy'>
      <Icon
        className='size-4'
        src={
          group.locked
            ? require('@fluentui/lock_closed_24_regular.svg')
            : require('@fluentui/globe_24_regular.svg')
        }
      />

      <Text theme='inherit' tag='span' size='sm' weight='medium'>
        {group.locked ? (
          <FormattedMessage id='group.privacy.locked' defaultMessage='Private' />
        ) : (
          <FormattedMessage id='group.privacy.public' defaultMessage='Public' />
        )}
      </Text>
    </HStack>
  </Popover>
);

export { GroupPrivacy as default };
