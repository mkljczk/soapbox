import React from 'react';

import Layout from 'pl-fe/components/ui/layout';

import MissingIndicator from '../../components/missing-indicator';

const GenericNotFound = () => (
  <>
    <Layout.Main>
      <MissingIndicator />
    </Layout.Main>

    <Layout.Aside />
  </>
);

export { GenericNotFound as default };
