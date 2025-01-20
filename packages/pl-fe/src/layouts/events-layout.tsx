import { Outlet } from '@tanstack/react-router';
import React from 'react';

import Layout from 'pl-fe/components/ui/layout';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  TrendsPanel,
  NewEventPanel,
} from 'pl-fe/features/ui/util/async-components';
import { useFeatures } from 'pl-fe/hooks/use-features';

/** Layout to display events list. */
const EventsLayout = () => {
  const features = useFeatures();

  return (
    <>
      <Layout.Main>
        <Outlet />
      </Layout.Main>

      <Layout.Aside>
        <NewEventPanel />
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

export { EventsLayout as default };
