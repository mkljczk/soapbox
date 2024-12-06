import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Column from 'pl-fe/components/ui/column';
import Divider from 'pl-fe/components/ui/divider';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useInstance } from 'pl-fe/hooks/use-instance';

import LinkFooter from '../ui/components/link-footer';
import PromoPanel from '../ui/components/panels/promo-panel';

const messages = defineMessages({
  heading: { id: 'column.info', defaultMessage: 'Server information' },
});

const ServerInfo = () => {
  const intl = useIntl();
  const instance = useInstance();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <Stack>
          <Text size='lg' weight='medium'>{instance.title}</Text>
          <Text theme='muted'>{instance.description}</Text>
        </Stack>

        <Divider />

        <PromoPanel />

        <Divider />

        <LinkFooter />
      </Stack>
    </Column>
  );
};

export { ServerInfo as default };
