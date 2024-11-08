import { Outlet } from '@tanstack/react-router';
import React from 'react';

import Layout from 'pl-fe/components/ui/layout';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import { MyGroupsPanel, NewGroupPanel } from 'pl-fe/features/ui/util/async-components';

/** Layout to display groups. */
const ManageGroupsLayout = () => (
  <>
    <Layout.Main>
      <Outlet />
    </Layout.Main>

    <Layout.Aside>
      <NewGroupPanel />
      <MyGroupsPanel />
      <LinkFooter />
    </Layout.Aside>
  </>
);

export { ManageGroupsLayout as default };
