import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { deleteStatusModal } from 'pl-fe/actions/moderation';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import StatusContent from 'pl-fe/components/status-content';
import StatusMedia from 'pl-fe/components/status-media';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

import type { SelectedStatus } from 'pl-fe/selectors';

const messages = defineMessages({
  viewStatus: { id: 'admin.reports.actions.view_status', defaultMessage: 'View post' },
  deleteStatus: { id: 'admin.statuses.actions.delete_status', defaultMessage: 'Delete post' },
});

interface IReportStatus {
  status: SelectedStatus;
}

const ReportStatus: React.FC<IReportStatus> = ({ status }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleDeleteStatus = () => {
    dispatch(deleteStatusModal(intl, status.id));
  };

  const makeMenu = () => {
    const acct = status.account.acct;

    return [{
      text: intl.formatMessage(messages.viewStatus, { acct: `@${acct}` }),
      to: `/@${acct}/posts/${status.id}`,
      icon: require('@fluentui/edit_24_regular.svg'),
    }, {
      text: intl.formatMessage(messages.deleteStatus, { acct: `@${acct}` }),
      action: handleDeleteStatus,
      icon: require('@fluentui/delete_24_regular.svg'),
      destructive: true,
    }];
  };

  const menu = makeMenu();

  return (
    <HStack space={2} alignItems='start'>
      <Stack space={2} className='overflow-hidden' grow>
        <StatusContent status={status} />
        <StatusMedia status={status} />
      </Stack>

      <div className='flex-none'>
        <DropdownMenu
          items={menu}
          src={require('@fluentui/more_vertical_24_regular.svg')}
        />
      </div>
    </HStack>
  );
};

export { ReportStatus as default };
