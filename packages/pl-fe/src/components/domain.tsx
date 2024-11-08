import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { unblockDomain } from 'pl-fe/actions/domain-blocks';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

const messages = defineMessages({
  blockDomainConfirm: { id: 'confirmations.domain_block.confirm', defaultMessage: 'Hide entire domain' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
});

interface IDomain {
  domain: string;
}

const Domain: React.FC<IDomain> = ({ domain }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  // const onBlockDomain = () => {
  //   openModal('CONFIRM', {
  //     heading: <FormattedMessage id='confirmations.domain_block.heading' defaultMessage='Block {domain}' values={{ domain }} />,
  //     message: <FormattedMessage id='confirmations.domain_block.message' defaultMessage='Are you really, really sure you want to block the entire {domain}? In most cases a few targeted blocks or mutes are sufficient and preferable.' values={{ domain: <strong>{domain}</strong> }} />,
  //     confirm: intl.formatMessage(messages.blockDomainConfirm),
  //     onConfirm: () => dispatch(blockDomain(domain)),
  //   });
  // }

  const handleDomainUnblock = () => {
    dispatch(unblockDomain(domain));
  };

  return (
    <HStack alignItems='center' justifyContent='between' space={1} className='p-2'>
      <Text tag='span'>
        {domain}
      </Text>
      <IconButton iconClassName='h-5 w-5' src={require('@fluentui/lock_open_24_regular.svg')} title={intl.formatMessage(messages.unblockDomain, { domain })} onClick={handleDomainUnblock} />
    </HStack>
  );
};

export { Domain as default };
