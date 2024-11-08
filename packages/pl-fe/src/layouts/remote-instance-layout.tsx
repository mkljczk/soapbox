import { Outlet } from '@tanstack/react-router';
import React from 'react';

import Layout from 'pl-fe/components/ui/layout';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import { remoteTimelineRoute } from 'pl-fe/features/ui/routes';
import {
  PromoPanel,
  InstanceInfoPanel,
  InstanceModerationPanel,
} from 'pl-fe/features/ui/util/async-components';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { federationRestrictionsDisclosed } from 'pl-fe/utils/state';

/** Layout for viewing a remote instance timeline. */
const RemoteInstanceLayout = () => {
  const { instance } = remoteTimelineRoute.useParams();

  const { account } = useOwnAccount();
  const disclosed = useAppSelector(federationRestrictionsDisclosed);

  return (
    <>
      <Layout.Main>
        <Outlet />
      </Layout.Main>

      <Layout.Aside>
        <PromoPanel />
        <InstanceInfoPanel host={instance} />
        {(disclosed || account?.is_admin) && (
          <InstanceModerationPanel host={instance} />
        )}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { RemoteInstanceLayout as default };
