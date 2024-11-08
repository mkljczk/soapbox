import React from 'react';

import Column from 'pl-fe/components/ui/column';
import Layout from 'pl-fe/components/ui/layout';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import { MyGroupsPanel, NewGroupPanel } from 'pl-fe/features/ui/util/async-components';

interface IGroupsLayout {
  children: React.ReactNode;
}

/** Layout to display groups. */
const GroupsLayout: React.FC<IGroupsLayout> = ({ children }) => (
  <>
    <Layout.Main>
      <Column withHeader={false}>
        <div className='space-y-4'>
          {children}
        </div>
      </Column>
    </Layout.Main>

    <Layout.Aside>
      <NewGroupPanel />
      <MyGroupsPanel />

      <LinkFooter />
    </Layout.Aside>
  </>
);

export { GroupsLayout as default };
