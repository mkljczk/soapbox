import React from 'react';
import { FormattedMessage } from 'react-intl';

import { changeSetting } from 'pl-fe/actions/settings';
import List, { ListItem } from 'pl-fe/components/list';
import Form from 'pl-fe/components/ui/form';
import SettingToggle from 'pl-fe/features/notifications/components/setting-toggle';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useSettings } from 'pl-fe/hooks/use-settings';

const PrivacySettings = () => {
  const dispatch = useAppDispatch();
  const settings = useSettings();

  const onToggleChange = (key: string[], checked: boolean) => {
    dispatch(changeSetting(key, checked));
  };

  return (
    <Form>
      <List>
        <ListItem label={<FormattedMessage id='home.column_settings.show_replies' defaultMessage='Show replies' />}>
          <SettingToggle settings={settings} settingPath={['home', 'shows', 'reply']} onChange={onToggleChange} />
        </ListItem>
      </List>
    </Form>
  );
};

export { PrivacySettings as default };
