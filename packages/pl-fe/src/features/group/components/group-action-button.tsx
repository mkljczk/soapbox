import { GroupRoles } from 'pl-api';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useJoinGroup } from 'pl-fe/api/hooks/groups/use-join-group';
import { useLeaveGroup } from 'pl-fe/api/hooks/groups/use-leave-group';
import Button from 'pl-fe/components/ui/button';
import { importEntities } from 'pl-fe/entity-store/actions';
import { Entities } from 'pl-fe/entity-store/entities';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useModalsStore } from 'pl-fe/stores/modals';
import toast from 'pl-fe/toast';

import type { Group, GroupRelationship } from 'pl-api';

interface IGroupActionButton {
  group: Pick<Group, 'id' | 'locked' | 'relationship'>;
}

const messages = defineMessages({
  confirmationConfirm: { id: 'confirmations.leave_group.confirm', defaultMessage: 'Leave' },
  confirmationHeading: { id: 'confirmations.leave_group.heading', defaultMessage: 'Leave group' },
  confirmationMessage: { id: 'confirmations.leave_group.message', defaultMessage: 'You are about to leave the group. Do you want to continue?' },
  joinRequestSuccess: { id: 'group.join.request_success', defaultMessage: 'Request sent to group owner' },
  joinSuccess: { id: 'group.join.success', defaultMessage: 'Group joined successfully!' },
  leaveSuccess: { id: 'group.leave.success', defaultMessage: 'Left the group' },
});

const GroupActionButton = ({ group }: IGroupActionButton) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { openModal } = useModalsStore();
  const joinGroup = useJoinGroup(group);
  const leaveGroup = useLeaveGroup(group);

  const isRequested = group.relationship?.requested;
  const isNonMember = !group.relationship?.member && !isRequested;
  const isOwner = group.relationship?.role === GroupRoles.OWNER;
  const isAdmin = group.relationship?.role === GroupRoles.ADMIN;

  const onJoinGroup = () => joinGroup.mutate({}, {
    onSuccess() {
      joinGroup.invalidate();

      toast.success(
        group.locked
          ? intl.formatMessage(messages.joinRequestSuccess)
          : intl.formatMessage(messages.joinSuccess),
      );
    },
    onError(error) {
      const message = error.response?.json?.error;
      if (message) {
        toast.error(message);
      }
    },
  });

  const onLeaveGroup = () =>
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.confirmationHeading),
      message: intl.formatMessage(messages.confirmationMessage),
      confirm: intl.formatMessage(messages.confirmationConfirm),
      onConfirm: () => leaveGroup.mutate(group.relationship?.id as string, {
        onSuccess() {
          leaveGroup.invalidate();
          toast.success(intl.formatMessage(messages.leaveSuccess));
        },
      }),
    });

  const onCancelRequest = () => leaveGroup.mutate(group.relationship?.id as string, {
    onSuccess() {
      const entity = {
        ...group.relationship as GroupRelationship,
        requested: false,
      };
      dispatch(importEntities([entity], Entities.GROUP_RELATIONSHIPS));
    },
  });

  if (isOwner || isAdmin) {
    return (
      <Button
        theme='secondary'
        to={`/groups/${group.id}/manage`}
      >
        <FormattedMessage id='group.manage' defaultMessage='Manage group' />
      </Button>
    );
  }

  if (isNonMember) {
    return (
      <Button
        theme='primary'
        onClick={onJoinGroup}
        disabled={joinGroup.isSubmitting}
      >
        {group.locked
          ? <FormattedMessage id='group.join.private' defaultMessage='Request access' />
          : <FormattedMessage id='group.join.public' defaultMessage='Join group' />}
      </Button>
    );
  }

  if (isRequested) {
    return (
      <Button
        theme='secondary'
        onClick={onCancelRequest}
        disabled={leaveGroup.isSubmitting}
      >
        <FormattedMessage id='group.cancel_request' defaultMessage='Cancel request' />
      </Button>
    );
  }

  return (
    <Button
      theme='secondary'
      onClick={onLeaveGroup}
      disabled={leaveGroup.isSubmitting}
    >
      <FormattedMessage id='group.leave' defaultMessage='Leave group' />
    </Button>
  );
};

export { GroupActionButton as default };
