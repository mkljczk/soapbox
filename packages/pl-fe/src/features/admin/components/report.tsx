import React, { useCallback, useState } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import { Link } from 'react-router-dom';

import { closeReport } from 'pl-fe/actions/admin';
import { deactivateUserModal, deleteUserModal } from 'pl-fe/actions/moderation';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import HoverAccountWrapper from 'pl-fe/components/hover-account-wrapper';
import Accordion from 'pl-fe/components/ui/accordion';
import Avatar from 'pl-fe/components/ui/avatar';
import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { makeGetReport } from 'pl-fe/selectors';
import toast from 'pl-fe/toast';

import ReportStatus from './report-status';

const messages = defineMessages({
  reportClosed: { id: 'admin.reports.report_closed_message', defaultMessage: 'Report on @{name} was closed' },
  deactivateUser: { id: 'admin.users.actions.deactivate_user', defaultMessage: 'Deactivate @{name}' },
  deleteUser: { id: 'admin.users.actions.delete_user', defaultMessage: 'Delete @{name}' },
});

interface IReport {
  id: string;
}

const Report: React.FC<IReport> = ({ id }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const getReport = useCallback(makeGetReport(), []);

  const report = useAppSelector((state) => getReport(state, id));

  const [accordionExpanded, setAccordionExpanded] = useState(false);

  if (!report) return null;

  const account = report.account;
  const targetAccount = report.target_account!;

  const makeMenu = () => [{
    text: intl.formatMessage(messages.deactivateUser, { name: targetAccount.username }),
    action: handleDeactivateUser,
    icon: require('@tabler/icons/outline/hourglass-empty.svg'),
  }, {
    text: intl.formatMessage(messages.deleteUser, { name: targetAccount.username }),
    action: handleDeleteUser,
    icon: require('@tabler/icons/outline/trash.svg'),
    destructive: true,
  }];

  const handleCloseReport = () => {
    dispatch(closeReport(report.id)).then(() => {
      const message = intl.formatMessage(messages.reportClosed, { name: targetAccount.username as string });
      toast.success(message);
    }).catch(() => {});
  };

  const handleDeactivateUser = () => {
    const accountId = targetAccount.id;
    dispatch(deactivateUserModal(intl, accountId!, () => handleCloseReport()));
  };

  const handleDeleteUser = () => {
    const accountId = targetAccount.id as string;
    dispatch(deleteUserModal(intl, accountId!, () => handleCloseReport()));
  };

  const handleAccordionToggle = (setting: boolean) => {
    setAccordionExpanded(setting);
  };

  const menu = makeMenu();
  const statuses = report.statuses;
  const statusCount = statuses.length;
  const acct = targetAccount.acct;
  const reporterAcct = account?.acct;

  return (
    <HStack space={3} className='p-3' key={report.id}>
      <HoverAccountWrapper accountId={targetAccount.id} element='span'>
        <Link to={`/@${acct}`} title={acct}>
          <Avatar
            src={targetAccount.avatar}
            alt={targetAccount.avatar_description}
            size={32}
            className='overflow-hidden'
          />
        </Link>
      </HoverAccountWrapper>

      <Stack space={3} className='overflow-hidden' grow>
        <Text tag='h4' weight='bold'>
          <FormattedMessage
            id='admin.reports.report_title'
            defaultMessage='Report on {acct}'
            values={{ acct: (
              <HoverAccountWrapper accountId={targetAccount.id} element='span'>
                <Link to={`/@${acct}`} title={acct}>@{acct}</Link>
              </HoverAccountWrapper>
            ) }}
          />
        </Text>

        {statusCount > 0 && (
          <Accordion
            headline={`Reported posts (${statusCount})`}
            expanded={accordionExpanded}
            onToggle={handleAccordionToggle}
          >
            <Stack space={4}>
              {statuses.map(status => (
                <ReportStatus
                  key={status.id}
                  status={status}
                />
              ))}
            </Stack>
          </Accordion>
        )}

        <Stack>
          {!!report.comment && report.comment.length > 0 && (
            <Text tag='blockquote'>
              {report.comment}
            </Text>
          )}

          {!!account && (
            <HStack space={1}>
              <Text theme='muted' tag='span'>&mdash;</Text>

              <HoverAccountWrapper accountId={account.id} element='span'>
                <Link
                  to={`/@${reporterAcct}`}
                  title={reporterAcct}
                  className='text-primary-600 hover:underline dark:text-accent-blue'
                >
                  @{reporterAcct}
                </Link>
              </HoverAccountWrapper>
            </HStack>
          )}
        </Stack>
      </Stack>

      <HStack space={2} alignItems='start' className='flex-none'>
        <Button onClick={handleCloseReport}>
          <FormattedMessage id='admin.reports.actions.close' defaultMessage='Close' />
        </Button>

        <DropdownMenu items={menu} src={require('@tabler/icons/outline/dots-vertical.svg')} />
      </HStack>
    </HStack>
  );
};

export { Report as default };
