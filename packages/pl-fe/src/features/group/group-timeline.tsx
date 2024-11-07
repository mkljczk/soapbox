import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from '@tanstack/react-router';

import { groupCompose, uploadCompose } from 'pl-fe/actions/compose';
import { fetchGroupTimeline } from 'pl-fe/actions/timelines';
import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import { useGroupStream } from 'pl-fe/api/hooks/streaming/use-group-stream';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import ComposeForm from 'pl-fe/features/compose/components/compose-form';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useDraggedFiles } from 'pl-fe/hooks/use-dragged-files';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { makeGetStatusIds } from 'pl-fe/selectors';

import Timeline from '../ui/components/timeline';

type RouteParams = { groupId: string };

interface IGroupTimeline {
  params: RouteParams;
}

const getStatusIds = makeGetStatusIds();

const GroupTimeline: React.FC<IGroupTimeline> = (props) => {
  const intl = useIntl();
  const { account } = useOwnAccount();
  const dispatch = useAppDispatch();
  const composer = useRef<HTMLDivElement>(null);

  const { groupId } = props.params;

  const { group } = useGroup(groupId);

  const composeId = `group:${groupId}`;
  const canComposeGroupStatus = !!account && group?.relationship?.member;
  const featuredStatusIds = useAppSelector((state) => getStatusIds(state, { type: `group:${group?.id}:pinned` }));

  const { isDragging, isDraggedOver } = useDraggedFiles(composer, (files) => {
    dispatch(uploadCompose(composeId, files, intl));
  });

  const handleLoadMore = (maxId: string) => {
    dispatch(fetchGroupTimeline(groupId, {}, true));
  };

  useGroupStream(groupId);

  useEffect(() => {
    dispatch(fetchGroupTimeline(groupId, {}));
    // dispatch(fetchGroupTimeline(groupId, { pinned: true }));
    dispatch(groupCompose(composeId, groupId));
  }, [groupId]);

  if (!group) {
    return null;
  }

  return (
    <Stack space={2}>
      {canComposeGroupStatus && (
        <div className='border-b border-solid border-gray-200 py-6 dark:border-gray-800'>
          <HStack
            ref={composer}
            alignItems='start'
            space={2}
            className={clsx('relative rounded-xl transition', {
              'border-2 border-primary-600 border-dashed z-[99] p-4': isDragging,
              'ring-2 ring-offset-2 ring-primary-600': isDraggedOver,
            })}
          >
            <Link to={`/@${account.acct}`}>
              <Avatar src={account.avatar} alt={account.avatar_description} size={42} />
            </Link>

            <ComposeForm
              id={composeId}
              shouldCondense
              autoFocus={false}
              group={groupId}
              withAvatar
              transparent
            />
          </HStack>
        </div>
      )}

      <Timeline
        scrollKey='group_timeline'
        timelineId={composeId}
        onLoadMore={handleLoadMore}
        emptyMessage={
          <Stack space={4} className='py-6' justifyContent='center' alignItems='center'>
            <div className='rounded-full bg-gray-200 p-4 dark:bg-gray-800'>
              <Icon
                src={require('@tabler/icons/outline/message-2.svg')}
                className='size-6 text-gray-600'
              />
            </div>

            <Text theme='muted'>
              <FormattedMessage id='empty_column.group' defaultMessage='There are no posts in this group yet.' />
            </Text>
          </Stack>
        }
        emptyMessageCard={false}
        divideType='border'
        showGroup={false}
        featuredStatusIds={featuredStatusIds}
      />
    </Stack>
  );
};

export { GroupTimeline as default };
