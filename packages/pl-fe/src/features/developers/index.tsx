import React from 'react';

import { useSettingsStore } from 'pl-fe/stores/settings';

import DevelopersChallenge from './developers-challenge';
import DevelopersMenu from './developers-menu';

const Developers: React.FC = () => {
  const { isDeveloper } = useSettingsStore().settings;

  return isDeveloper ? <DevelopersMenu /> : <DevelopersChallenge />;
};

export { Developers as default };
