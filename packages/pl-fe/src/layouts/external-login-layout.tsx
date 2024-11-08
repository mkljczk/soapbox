import React from 'react';

import Layout from 'pl-fe/components/ui/layout';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
} from 'pl-fe/features/ui/util/async-components';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { isStandalone } from 'pl-fe/utils/state';

interface IExternalLoginLayout {
  children: React.ReactNode;
}

const ExternalLoginLayout: React.FC<IExternalLoginLayout> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();
  const standalone = useAppSelector(isStandalone);

  return (
    <>
      <Layout.Main>
        {children}
      </Layout.Main>

      <Layout.Aside>
        {!me && !standalone && (
          <SignUpPanel />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {me && features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export { ExternalLoginLayout as default };
