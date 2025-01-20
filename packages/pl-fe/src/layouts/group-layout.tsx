import { Outlet } from '@tanstack/react-router';
import React, { useMemo } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import { useGroupMembershipRequests } from 'pl-fe/api/hooks/groups/use-group-membership-requests';
import Column from 'pl-fe/components/ui/column';
import Icon from 'pl-fe/components/ui/icon';
import Layout from 'pl-fe/components/ui/layout';
import Stack from 'pl-fe/components/ui/stack';
import Tabs from 'pl-fe/components/ui/tabs';
import Text from 'pl-fe/components/ui/text';
import GroupHeader from 'pl-fe/features/group/components/group-header';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  GroupMediaPanel,
  SignUpPanel,
} from 'pl-fe/features/ui/util/async-components';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';

const messages = defineMessages({
  all: { id: 'group.tabs.all', defaultMessage: 'All' },
  members: { id: 'group.tabs.members', defaultMessage: 'Members' },
  media: { id: 'group.tabs.media', defaultMessage: 'Media' },
});

interface IGroupLayout {
  params?: {
    groupId?: string;
  };
}

const PrivacyBlankslate = () => (
  <Stack space={4} className='py-10' alignItems='center'>
    <div className='rounded-full bg-gray-200 p-3 dark:bg-gray-800'>
      <Icon
        src={require('@tabler/icons/outline/eye-off.svg')}
        className='size-6 text-gray-600 dark:text-gray-600'
      />
    </div>

    <Text theme='muted'>
      <FormattedMessage
        id='group.private.message'
        defaultMessage='Content is only visible to group members'
      />
    </Text>
  </Stack>
);

/** Layout to display a group. */
const GroupLayout: React.FC<IGroupLayout> = ({ params }) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { account: me } = useOwnAccount();

  const groupId = params?.groupId || '';

  const { group } = useGroup(groupId);
  const { accounts: pending } = useGroupMembershipRequests(groupId);

  const isMember = !!group?.relationship?.member;
  const isPrivate = group?.locked;

  const tabItems = useMemo(() => {
    const items = [];
    items.push({
      text: intl.formatMessage(messages.all),
      to: `/groups/${groupId}`,
      name: '/groups/:groupId',
    });

    items.push(
      {
        text: intl.formatMessage(messages.media),
        to: `/groups/${groupId}/media`,
        name: '/groups/:groupId/media',
      },
      {
        text: intl.formatMessage(messages.members),
        to: `/groups/${groupId}/members`,
        name: '/groups/:groupId/members',
        count: pending.length,
      },
    );

    return items;
  }, [pending.length, groupId]);

  const renderChildren = () => {
    if (!isMember && isPrivate) {
      return <PrivacyBlankslate />;
    } else {
      return <Outlet />;
    }
  };

  return (
    <>
      <Layout.Main>
        <Column size='lg' label={group ? group.display_name : ''} withHeader={false}>
          <GroupHeader key={`group-header-${groupId}`} group={group} />

          <Tabs
            key={`group-tabs-${groupId}`}
            items={tabItems}
            activeItem={match.path}
          />

          {renderChildren()}
        </Column>
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        <GroupMediaPanel group={group} />
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { GroupLayout as default };
