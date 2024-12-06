import { GroupRoles } from 'pl-api';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { useDeleteGroup } from 'pl-fe/api/hooks/groups/use-delete-group';
import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import List, { ListItem } from 'pl-fe/components/list';
import { CardBody, CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import Text from 'pl-fe/components/ui/text';
import { useModalsStore } from 'pl-fe/stores/modals';
import toast from 'pl-fe/toast';

import Emojify from '../emoji/emojify';
import ColumnForbidden from '../ui/components/column-forbidden';

type RouteParams = { groupId: string };

const messages = defineMessages({
  heading: { id: 'column.manage_group', defaultMessage: 'Manage group' },
  editGroup: { id: 'manage_group.edit_group', defaultMessage: 'Edit group' },
  pendingRequests: { id: 'manage_group.pending_requests', defaultMessage: 'Pending requests' },
  blockedMembers: { id: 'manage_group.blocked_members', defaultMessage: 'Banned members' },
  deleteGroup: { id: 'manage_group.delete_group', defaultMessage: 'Delete group' },
  deleteConfirm: { id: 'confirmations.delete_group.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.delete_group.heading', defaultMessage: 'Delete group' },
  deleteMessage: { id: 'confirmations.delete_group.message', defaultMessage: 'Are you sure you want to delete this group? This is a permanent action that cannot be undone.' },
  members: { id: 'group.tabs.members', defaultMessage: 'Members' },
  other: { id: 'settings.other', defaultMessage: 'Other options' },
  deleteSuccess: { id: 'group.delete.success', defaultMessage: 'Group successfully deleted' },
});

interface IManageGroup {
  params: RouteParams;
}

const ManageGroup: React.FC<IManageGroup> = ({ params }) => {
  const { groupId: id } = params;

  const { openModal } = useModalsStore();
  const history = useHistory();
  const intl = useIntl();

  const { group } = useGroup(id);

  const deleteGroup = useDeleteGroup();

  const isOwner = group?.relationship?.role === GroupRoles.OWNER;

  if (!group || !group.relationship) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Spinner />
      </Column>
    );
  }

  if (!group.relationship.role || !['owner', 'admin', 'moderator'].includes(group.relationship.role)) {
    return (<ColumnForbidden />);
  }

  const onDeleteGroup = () =>
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteGroup.mutate(group.id, {
          onSuccess() {
            toast.success(intl.formatMessage(messages.deleteSuccess));
            history.push('/groups');
          },
        });
      },
    });

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref={`/groups/${group.id}`}>
      <CardBody className='space-y-4'>
        {isOwner && (
          <>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.editGroup)} />
            </CardHeader>

            <List>
              <ListItem label={intl.formatMessage(messages.editGroup)} to={`/groups/${group.id}/manage/edit`}>
                <span><Emojify text={group.display_name} emojis={group.emojis} /></span>
              </ListItem>
            </List>
          </>
        )}

        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.members)} />
        </CardHeader>

        <List>
          <ListItem label={intl.formatMessage(messages.pendingRequests)} to={`/groups/${group.id}/manage/requests`} />

          <ListItem label={intl.formatMessage(messages.blockedMembers)} to={`/groups/${group.id}/manage/blocks`} />
        </List>

        {isOwner && (
          <>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.other)} />
            </CardHeader>

            <List>
              <ListItem label={<Text theme='danger'>{intl.formatMessage(messages.deleteGroup)}</Text>} onClick={onDeleteGroup} />
            </List>
          </>
        )}
      </CardBody>
    </Column>
  );
};

export { ManageGroup as default };
