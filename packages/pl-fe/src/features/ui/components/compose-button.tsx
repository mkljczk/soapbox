import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation, useRouteMatch } from 'react-router-dom';

import { groupComposeModal } from 'pl-fe/actions/compose';
import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import Avatar from 'pl-fe/components/ui/avatar';
import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useModalsStore } from 'pl-fe/stores/modals';

const ComposeButton = () => {
  const location = useLocation();
  const isOnGroupPage = location.pathname.startsWith('/group/');
  const match = useRouteMatch<{ groupId: string }>('/groups/:groupId');
  const { group } = useGroup(match?.params.groupId || '');
  const isGroupMember = !!group?.relationship?.member;

  if (isOnGroupPage && isGroupMember) {
    return <GroupComposeButton />;
  }

  return <HomeComposeButton />;
};

const HomeComposeButton = () => {
  const { openModal } = useModalsStore();
  const onOpenCompose = () => openModal('COMPOSE');

  return (
    <Button
      theme='accent'
      size='lg'
      onClick={onOpenCompose}
      block
    >
      <FormattedMessage id='navigation.compose' defaultMessage='Compose' />
    </Button>
  );
};

const GroupComposeButton = () => {
  const dispatch = useAppDispatch();
  const match = useRouteMatch<{ groupId: string }>('/groups/:groupId');
  const { group } = useGroup(match?.params.groupId || '');

  if (!group) return null;

  const onOpenCompose = () => {
    dispatch(groupComposeModal(group));
  };

  return (
    <Button
      theme='accent'
      size='lg'
      onClick={onOpenCompose}
      block
    >
      <HStack space={3} alignItems='center'>
        <Avatar className='-my-1 border-2 border-white' size={30} src={group.avatar} alt={group.avatar_description} />
        <span>
          <FormattedMessage id='navigation.compose_group' defaultMessage='Compose to group' />
        </span>
      </HStack>
    </Button>
  );
};

export { ComposeButton as default };
