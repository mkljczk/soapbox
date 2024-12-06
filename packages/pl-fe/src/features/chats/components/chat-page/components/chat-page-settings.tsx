import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { changeSetting } from 'pl-fe/actions/settings';
import List, { ListItem } from 'pl-fe/components/list';
import Button from 'pl-fe/components/ui/button';
import { CardBody, CardTitle } from 'pl-fe/components/ui/card';
import Form from 'pl-fe/components/ui/form';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Toggle from 'pl-fe/components/ui/toggle';
import SettingToggle from 'pl-fe/features/notifications/components/setting-toggle';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { useUpdateCredentials } from 'pl-fe/queries/accounts';

type FormData = {
  accepts_chat_messages?: boolean;
}

const messages = defineMessages({
  title: { id: 'chat.page_settings.title', defaultMessage: 'Message Settings' },
  preferences: { id: 'chat.page_settings.preferences', defaultMessage: 'Preferences' },
  privacy: { id: 'chat.page_settings.privacy', defaultMessage: 'Privacy' },
  acceptingMessageLabel: { id: 'chat.page_settings.accepting_messages.label', defaultMessage: 'Allow users to start a new chat with you' },
  playSoundsLabel: { id: 'chat.page_settings.play_sounds.label', defaultMessage: 'Play a sound when you receive a message' },
  submit: { id: 'chat.page_settings.submit', defaultMessage: 'Save' },
});

const ChatPageSettings = () => {
  const { account } = useOwnAccount();
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const settings = useSettings();
  const updateCredentials = useUpdateCredentials();

  const [data, setData] = useState<FormData>({
    accepts_chat_messages: account?.accepts_chat_messages === true,
  });

  const onToggleChange = (key: string[], checked: boolean) => {
    dispatch(changeSetting(key, checked, { showAlert: true }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    updateCredentials.mutate(data);
  };

  return (
    <Stack className='h-full space-y-8 px-4 py-6 sm:p-6'>
      <HStack alignItems='center'>
        <IconButton
          src={require('@tabler/icons/outline/arrow-left.svg')}
          className='mr-2 size-7 sm:mr-0 sm:hidden rtl:rotate-180'
          onClick={() => history.push('/chats')}
        />

        <CardTitle title={intl.formatMessage(messages.title)} />
      </HStack>

      <Form onSubmit={handleSubmit}>
        <CardTitle title={intl.formatMessage(messages.preferences)} />

        <List>
          <ListItem
            label={intl.formatMessage(messages.playSoundsLabel)}
          >
            <SettingToggle settings={settings} settingPath={['chats', 'sound']} onChange={onToggleChange} />
          </ListItem>
        </List>

        <CardTitle title={intl.formatMessage(messages.privacy)} />

        <CardBody>
          <List>
            <ListItem
              label={intl.formatMessage(messages.acceptingMessageLabel)}
            >
              <Toggle
                checked={data.accepts_chat_messages}
                onChange={(event) => setData((prevData) => ({ ...prevData, accepts_chat_messages: event.target.checked }))}
              />
            </ListItem>
          </List>
        </CardBody>

        <Button type='submit' theme='primary' disabled={updateCredentials.isPending}>
          {intl.formatMessage(messages.submit)}
        </Button>
      </Form>
    </Stack>
  );
};

export { ChatPageSettings as default };
