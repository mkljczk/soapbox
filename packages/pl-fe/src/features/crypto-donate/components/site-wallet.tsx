import React from 'react';

import Stack from 'pl-fe/components/ui/stack';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';

import CryptoAddress from './crypto-address';

interface ISiteWallet {
  limit?: number;
}

const SiteWallet: React.FC<ISiteWallet> = ({ limit }): JSX.Element => {
  const { cryptoAddresses } = usePlFeConfig();
  const addresses = typeof limit === 'number' ? cryptoAddresses.slice(0, limit) : cryptoAddresses;

  return (
    <Stack space={4}>
      {addresses.map(address => (
        <CryptoAddress
          key={address.ticker}
          address={address.address}
          ticker={address.ticker}
          note={address.note}
        />
      ))}
    </Stack>
  );
};

export { SiteWallet as default };
