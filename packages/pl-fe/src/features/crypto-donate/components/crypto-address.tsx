import React from 'react';

import CopyableInput from 'pl-fe/components/copyable-input';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { CryptoIcon } from 'pl-fe/features/ui/util/async-components';
import { useModalsStore } from 'pl-fe/stores/modals';

import { getExplorerUrl } from '../utils/block-explorer';
import { getTitle } from '../utils/coin-db';

interface ICryptoAddress {
  address: string;
  ticker: string;
  note?: string;
}

const CryptoAddress: React.FC<ICryptoAddress> = (props): JSX.Element => {
  const { address, ticker, note } = props;

  const { openModal } = useModalsStore();

  const handleModalClick = (e: React.MouseEvent<HTMLElement>): void => {
    openModal('CRYPTO_DONATE', props);
    e.preventDefault();
  };

  const title = getTitle(ticker);
  const explorerUrl = getExplorerUrl(ticker, address);

  return (
    <Stack>
      <HStack alignItems='center' className='mb-1'>
        <CryptoIcon
          className='mr-2.5 flex w-6 items-start justify-center rtl:ml-2.5 rtl:mr-0'
          ticker={ticker}
          title={title}
        />

        <Text weight='bold'>{title || ticker.toUpperCase()}</Text>

        <HStack alignItems='center' className='ml-auto'>
          <a className='ml-1 text-gray-500 rtl:ml-0 rtl:mr-1' href='#' onClick={handleModalClick}>
            <Icon src={require('@tabler/icons/outline/qrcode.svg')} size={20} />
          </a>

          {explorerUrl && (
            <a className='ml-1 text-gray-500 rtl:ml-0 rtl:mr-1' href={explorerUrl} target='_blank'>
              <Icon src={require('@tabler/icons/outline/external-link.svg')} size={20} />
            </a>
          )}
        </HStack>
      </HStack>

      {note && (
        <Text>{note}</Text>
      )}

      <CopyableInput value={address} />
    </Stack>
  );
};

export {
  type ICryptoAddress,
  CryptoAddress as default,
};
