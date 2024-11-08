import get from 'lodash/get';
import React from 'react';

import Toggle from 'pl-fe/components/ui/toggle';
import { Settings } from 'pl-fe/schemas/pl-fe/settings';

interface ISettingToggle {
  /** Unique identifier for the Toggle. */
  id?: string;
  /** The full user settings map. */
  settings: Settings;
  /** Array of key names leading into the setting map. */
  settingPath: string[];
  /** Callback when the setting is toggled. */
  onChange: (settingPath: string[], checked: boolean) => void;
}

/** Stateful toggle to change user settings. */
const SettingToggle: React.FC<ISettingToggle> = ({ id, settings, settingPath, onChange }) => {

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    onChange(settingPath, target.checked);
  };

  return (
    <Toggle
      id={id}
      checked={!!get(settings, settingPath)}
      onChange={handleChange}
    />
  );
};

export { SettingToggle as default };
