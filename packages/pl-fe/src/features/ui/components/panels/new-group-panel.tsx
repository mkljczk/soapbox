import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useModalsStore } from 'pl-fe/stores/modals';

const NewGroupPanel = () => {
  const { openModal } = useModalsStore();

  const createGroup = () => {
    openModal('CREATE_GROUP');
  };

  return (
    <Stack space={2}>
      <Stack>
        <Text size='lg' weight='bold'>
          <FormattedMessage id='new_group_panel.title' defaultMessage='Create group' />
        </Text>

        <Text theme='muted' size='sm'>
          <FormattedMessage id='new_group_panel.subtitle' defaultMessage="Can't find what you're looking for? Start your own private or public group." />
        </Text>
      </Stack>

      <Button
        onClick={createGroup}
        theme='secondary'
        block
      >
        <FormattedMessage id='new_group_panel.action' defaultMessage='Create Group' />
      </Button>
    </Stack>
  );
};

export { NewGroupPanel as default };
