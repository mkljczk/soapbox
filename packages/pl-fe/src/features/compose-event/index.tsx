import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { cancelEventCompose } from 'pl-fe/actions/events';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import Tabs from 'pl-fe/components/ui/tabs';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

import { EditEvent } from './tabs/edit-event';
import { ManagePendingParticipants } from './tabs/manage-pending-participants';

const messages = defineMessages({
  manageEvent: { id: 'navigation_bar.manage_event', defaultMessage: 'Manage event' },
  createEvent: { id: 'navigation_bar.create_event', defaultMessage: 'Create new event' },
  edit: { id: 'compose_event.tabs.edit', defaultMessage: 'Edit details' },
  pending: { id: 'compose_event.tabs.pending', defaultMessage: 'Manage requests' },
});

type RouteParams = {
  statusId?: string;
};

interface IComposeEvent {
  params: RouteParams;
}

const ComposeEvent: React.FC<IComposeEvent> = ({ params }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const statusId = params.statusId || null;

  const [tab, setTab] = useState<'edit' | 'pending'>('edit');

  useEffect(() => () => {
    dispatch(cancelEventCompose());
  }, [statusId]);

  const renderTabs = () => {
    const items = [
      {
        text: intl.formatMessage(messages.edit),
        action: () => setTab('edit'),
        name: 'edit',
      },
      {
        text: intl.formatMessage(messages.pending),
        action: () => setTab('pending'),
        name: 'pending',
      },
    ];

    return <Tabs items={items} activeItem={tab} />;
  };

  return (
    <Column label={intl.formatMessage(statusId ? messages.manageEvent : messages.createEvent)}>
      <Stack space={2}>
        {statusId && renderTabs()}
        {tab === 'edit' ? <EditEvent statusId={statusId} /> : <ManagePendingParticipants statusId={statusId!} />}
      </Stack>
    </Column>
  );
};

export { ComposeEvent as default };
