import React from 'react';

import Layout from 'pl-fe/components/ui/layout';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import { MyGroupsPanel, NewGroupPanel } from 'pl-fe/features/ui/util/async-components';

interface IGroupsLayout {
  children: React.ReactNode;
}

/** Layout to display groups. */
const ManageGroupsLayout: React.FC<IGroupsLayout> = ({ children }) => (
  <>
    <Layout.Main>
      {children}
    </Layout.Main>

    <Layout.Aside>
      <NewGroupPanel />
      <MyGroupsPanel />
      <LinkFooter />
    </Layout.Aside>
  </>
);

export { ManageGroupsLayout as default };
