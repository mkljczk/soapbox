import React from 'react';
import { Helmet as ReactHelmet } from 'react-helmet-async';

import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import { useStatContext } from 'pl-fe/contexts/stat-context';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { RootState } from 'pl-fe/store';
import FaviconService from 'pl-fe/utils/favicon-service';

FaviconService.initFaviconService();

const getNotifTotals = (state: RootState): number => {
  const notifications = state.notifications.unread || 0;
  const reports = state.admin.openReports.length;
  const approvals = state.admin.awaitingApproval.length;
  return notifications + reports + approvals;
};

interface IHelmet {
  children: React.ReactNode;
}

const Helmet: React.FC<IHelmet> = ({ children }) => {
  const { data: instance } = useInstance();
  const { unreadChatsCount } = useStatContext();
  const unreadCount = useAppSelector((state) => getNotifTotals(state) + unreadChatsCount);
  const { demetricator } = useSettings();

  const hasUnreadNotifications = React.useMemo(() => !(unreadCount < 1 || demetricator), [unreadCount, demetricator]);

  const addCounter = (string: string) => hasUnreadNotifications ? `(${unreadCount}) ${string}` : string;

  const updateFaviconBadge = () => {
    if (hasUnreadNotifications) {
      FaviconService.drawFaviconBadge();
    } else {
      FaviconService.clearFaviconBadge();
    }
  };

  React.useEffect(() => {
    updateFaviconBadge();
  }, [unreadCount, demetricator]);

  return (
    <ReactHelmet
      titleTemplate={addCounter(`%s | ${instance.title}`)}
      defaultTitle={addCounter(instance.title)}
      defer={false}
    >
      {children}
    </ReactHelmet>
  );
};

export { Helmet as default };
