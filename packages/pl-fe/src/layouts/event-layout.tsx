import { Outlet } from '@tanstack/react-router';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import Column from 'pl-fe/components/ui/column';
import Layout from 'pl-fe/components/ui/layout';
import Tabs from 'pl-fe/components/ui/tabs';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  EventHeader,
  SignUpPanel,
  TrendsPanel,
  WhoToFollowPanel,
} from 'pl-fe/features/ui/util/async-components';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { makeGetStatus } from 'pl-fe/selectors';

const getStatus = makeGetStatus();

interface IEventLayout {
  params?: {
    statusId?: string;
  };
}

const EventLayout: React.FC<IEventLayout> = ({ params }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  const history = useHistory();
  const statusId = params?.statusId!;

  const status = useAppSelector(state => getStatus(state, { id: statusId }) || undefined);

  const event = status?.event;

  if (status && !event) {
    history.push(`/@${status.account.acct}/posts/${status.id}`);
    return (
      <PlaceholderStatus />
    );
  }

  const pathname = history.location.pathname;
  const activeItem = pathname.endsWith('/discussion') ? 'discussion' : 'info';

  const tabs = status ? [
    {
      text: <FormattedMessage id='event.information' defaultMessage='Information' />,
      to: `/@${status.account.acct}/events/${status.id}`,
      name: 'info',
    },
    {
      text: <FormattedMessage id='event.discussion' defaultMessage='Discussion' />,
      to: `/@${status.account.acct}/events/${status.id}/discussion`,
      name: 'discussion',
    },
  ] : [];

  const showTabs = !['/participations', 'participation_requests'].some(path => pathname.endsWith(path));

  return (
    <>
      {status?.account.local === false && (
        <Helmet>
          <meta content='noindex, noarchive' name='robots' />
        </Helmet>
      )}
      <Layout.Main>
        <Column label={event?.name} withHeader={false}>
          <div className='space-y-4'>
            <EventHeader status={status} />

            {status && showTabs && (
              <Tabs key={`event-tabs-${status.id}`} items={tabs} activeItem={activeItem} />
            )}

            <Outlet />
          </div>
        </Column>
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export { EventLayout as default };
