import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link, matchPath, useHistory } from 'react-router-dom';

import Button from 'pl-fe/components/ui/button';
import Divider from 'pl-fe/components/ui/divider';
import HStack from 'pl-fe/components/ui/hstack';
import Popover from 'pl-fe/components/ui/popover';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Emojify from 'pl-fe/features/emoji/emojify';
import GroupMemberCount from 'pl-fe/features/group/components/group-member-count';
import GroupPrivacy from 'pl-fe/features/group/components/group-privacy';

import GroupAvatar from '../group-avatar';

import type { Group } from 'pl-fe/normalizers/group';

interface IGroupPopoverContainer {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  isEnabled: boolean;
  group: Group;
}

const messages = defineMessages({
  title: { id: 'group.popover.title', defaultMessage: 'Membership required' },
  summary: { id: 'group.popover.summary', defaultMessage: 'You must be a member of the group in order to reply to this status.' },
  action: { id: 'group.popover.action', defaultMessage: 'View group' },
});

const GroupPopover = (props: IGroupPopoverContainer) => {
  const { children, group, isEnabled } = props;

  const intl = useIntl();
  const history = useHistory();

  const path = history.location.pathname;
  const shouldHideAction = matchPath(path, {
    path: ['/groups/:groupId'],
    exact: true,
  });

  if (!isEnabled) {
    return children;
  }

  return (
    <Popover
      interaction='click'
      referenceElementClassName='cursor-pointer'
      content={
        <Stack space={4} className='w-80 pb-4'>
          <Stack
            className='black:bg-white dark:border-primary-800 dark:bg-primary-900 relative h-60 rounded-lg bg-white'
            data-testid='group-card'
          >
            {/* Group Cover Image */}
            <Stack grow className='bg-primary-100 relative basis-1/2 rounded-t-lg dark:bg-gray-800'>
              {group.header && (
                <img
                  className='absolute inset-0 size-full rounded-t-lg object-cover'
                  src={group.header}
                  alt={group.header_description}
                />
              )}
            </Stack>

            {/* Group Avatar */}
            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
              <GroupAvatar group={group} size={64} withRing />
            </div>

            {/* Group Info */}
            <Stack alignItems='center' justifyContent='end' grow className='basis-1/2 py-4' space={0.5}>
              <Text size='lg' weight='bold'>
                <Emojify text={group.display_name} emojis={group.emojis} />
              </Text>

              <HStack className='text-gray-700 dark:text-gray-600' space={2} wrap>
                <GroupPrivacy group={group} />
                <GroupMemberCount group={group} />
              </HStack>
            </Stack>
          </Stack>

          <Divider />

          <Stack space={0.5} className='px-4'>
            <Text weight='semibold'>
              {intl.formatMessage(messages.title)}
            </Text>
            <Text theme='muted'>
              {intl.formatMessage(messages.summary)}
            </Text>
          </Stack>

          {!shouldHideAction && (
            <div className='px-4'>
              <Link to={`/groups/${group.id}`}>
                <Button type='button' theme='secondary' block>
                  {intl.formatMessage(messages.action)}
                </Button>
              </Link>
            </div>
          )}
        </Stack>
      }
      isFlush
    >
      <div className='inline-block'>{children}</div>
    </Popover>
  );
};

export { GroupPopover as default };
