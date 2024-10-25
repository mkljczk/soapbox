import React, { useState, useEffect } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';

import { changeSetting, updateSettingsStore } from 'pl-fe/actions/settings';
import List, { ListItem } from 'pl-fe/components/list';
import Button from 'pl-fe/components/ui/button';
import { CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import Textarea from 'pl-fe/components/ui/textarea';
import SettingToggle from 'pl-fe/features/notifications/components/setting-toggle';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useSettingsStore } from 'pl-fe/stores/settings';
import toast from 'pl-fe/toast';

const isJSONValid = (text: any): boolean => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

const messages = defineMessages({
  heading: { id: 'column.settings_store', defaultMessage: 'Settings store' },
  advanced: { id: 'developers.settings_store.advanced', defaultMessage: 'Advanced settings' },
  hint: { id: 'developers.settings_store.hint', defaultMessage: 'It is possible to directly edit your user settings here. BE CAREFUL! Editing this section can break your account, and you will only be able to recover through the API.' },
});

const SettingsStore: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { settings, userSettings, loadUserSettings } = useSettingsStore();

  const [rawJSON, setRawJSON] = useState<string>(JSON.stringify(userSettings, null, 2));
  const [jsonValid, setJsonValid] = useState(true);
  const [isLoading, setLoading] = useState(false);

  const handleEditJSON: React.ChangeEventHandler<HTMLTextAreaElement> = ({ target }) => {
    const rawJSON = target.value;
    setRawJSON(rawJSON);
    setJsonValid(isJSONValid(rawJSON));
  };

  const onToggleChange = (key: string[], checked: boolean) => {
    dispatch(changeSetting(key, checked, { showAlert: true }));
  };

  const handleSubmit: React.FormEventHandler = e => {
    const settings = JSON.parse(rawJSON);

    setLoading(true);
    dispatch(updateSettingsStore(settings)).then(() => {
      loadUserSettings(settings);
      setLoading(false);
    }).catch(error => {
      toast.showAlertForError(error);
      setLoading(false);
    });
  };

  useEffect(() => {
    setRawJSON(JSON.stringify(userSettings, null, 2));
    setJsonValid(true);
  }, [userSettings]);

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref='/developers'>
      <Form onSubmit={handleSubmit}>
        <FormGroup
          hintText={intl.formatMessage(messages.hint)}
          errors={jsonValid ? [] : ['is invalid']}
        >
          <Textarea
            value={rawJSON}
            onChange={handleEditJSON}
            disabled={isLoading}
            rows={12}
            isCodeEditor
          />
        </FormGroup>

        <FormActions>
          <Button theme='primary' type='submit' disabled={!jsonValid || isLoading}>
            <FormattedMessage id='plfe_config.save' defaultMessage='Save' />
          </Button>
        </FormActions>
      </Form>

      <CardHeader className='mb-4'>
        <CardTitle title={intl.formatMessage(messages.advanced)} />
      </CardHeader>

      <List>
        <ListItem
          label={<FormattedMessage id='preferences.fields.demo_label' defaultMessage='Demo mode' />}
          hint={<FormattedMessage id='preferences.fields.demo_hint' defaultMessage='Use the default pl-fe logo and color scheme. Useful for taking screenshots.' />}
        >
          <SettingToggle settings={settings} settingPath={['demo']} onChange={onToggleChange} />
        </ListItem>
      </List>
    </Column>
  );
};

export { SettingsStore as default };
