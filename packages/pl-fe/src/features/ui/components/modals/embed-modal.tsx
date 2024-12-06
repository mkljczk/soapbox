import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import CopyableInput from 'pl-fe/components/copyable-input';
import SafeEmbed from 'pl-fe/components/safe-embed';
import Divider from 'pl-fe/components/ui/divider';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import useEmbed from 'pl-fe/queries/embed';

import type { BaseModalProps } from '../modal-root';

interface EmbedModalProps {
  url: string;
  onError: (error: any) => void;
}

const EmbedModal: React.FC<BaseModalProps & EmbedModalProps> = ({ onClose, onError, url }) => {
  const { data: embed, error, isError } = useEmbed(url);

  useEffect(() => {
    if (error && isError) {
      onError(error);
    }
  }, [isError]);

  const handleClose = () => {
    onClose('EMBED');
  };

  return (
    <Modal
      title={<FormattedMessage id='status.embed' defaultMessage='Embed post' />}
      onClose={handleClose}
    >
      <Stack space={4}>
        <Text theme='muted'>
          <FormattedMessage id='embed.instructions' defaultMessage='Embed this post on your website by copying the code below.' />
        </Text>

        <CopyableInput value={embed?.html || ''} />
      </Stack>

      <div className='py-9'>
        <Divider />
      </div>

      <SafeEmbed
        className='w-full overflow-hidden rounded-xl'
        sandbox='allow-same-origin allow-scripts'
        title='embedded-status'
        html={embed?.html}
      />
    </Modal>
  );
};

export { EmbedModal as default, type EmbedModalProps };
