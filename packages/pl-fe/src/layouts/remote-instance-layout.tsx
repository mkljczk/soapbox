import React from 'react';

import Layout from 'pl-fe/components/ui/layout';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  PromoPanel,
  InstanceInfoPanel,
  InstanceModerationPanel,
} from 'pl-fe/features/ui/util/async-components';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { federationRestrictionsDisclosed } from 'pl-fe/utils/state';

interface IRemoteInstanceLayout {
  params?: {
    instance?: string;
  };
  children: React.ReactNode;
}

/** Layout for viewing a remote instance timeline. */
const RemoteInstanceLayout: React.FC<IRemoteInstanceLayout> = ({ children, params }) => {
  const host = params!.instance!;

  const { account } = useOwnAccount();
  const disclosed = useAppSelector(federationRestrictionsDisclosed);

  return (
    <>
      <Layout.Main>
        {children}
      </Layout.Main>

      <Layout.Aside>
        <PromoPanel />
        <InstanceInfoPanel host={host} />
        {(disclosed || account?.is_admin) && (
          <InstanceModerationPanel host={host} />
        )}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { RemoteInstanceLayout as default };
