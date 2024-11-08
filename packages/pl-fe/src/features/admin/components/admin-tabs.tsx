import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import Tabs from 'pl-fe/components/ui/tabs';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

const messages = defineMessages({
  dashboard: { id: 'admin_nav.dashboard', defaultMessage: 'Dashboard' },
  reports: { id: 'admin_nav.reports', defaultMessage: 'Reports' },
  waitlist: { id: 'admin_nav.awaiting_approval', defaultMessage: 'Waitlist' },
});

const AdminTabs: React.FC = () => {
  const intl = useIntl();
  const match = useRouteMatch();

  const approvalCount = useAppSelector(state => state.admin.awaitingApproval.length);
  const reportsCount = useAppSelector(state => state.admin.openReports.length);

  const tabs = [{
    name: '/pl-fe/admin',
    text: intl.formatMessage(messages.dashboard),
    to: '/pl-fe/admin',
  }, {
    name: '/pl-fe/admin/reports',
    text: intl.formatMessage(messages.reports),
    to: '/pl-fe/admin/reports',
    count: reportsCount,
  }, {
    name: '/pl-fe/admin/approval',
    text: intl.formatMessage(messages.waitlist),
    to: '/pl-fe/admin/approval',
    count: approvalCount,
  }];

  return <Tabs items={tabs} activeItem={match.path} />;
};

export { AdminTabs as default };
