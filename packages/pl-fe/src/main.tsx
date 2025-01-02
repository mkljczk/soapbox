import './polyfills';

import React from 'react';
import { createRoot } from 'react-dom/client';

import * as BuildConfig from 'pl-fe/build-config';
import PlFe from 'pl-fe/init/pl-fe';
import { printConsoleWarning } from 'pl-fe/utils/console';

import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/900.css';
import '@fontsource/roboto-mono/400.css';
import 'line-awesome/dist/font-awesome-line-awesome/css/all.css';
import 'react-datepicker/dist/react-datepicker.css';

import './iframe';
import './styles/i18n/arabic.css';
import './styles/i18n/javanese.css';
import './styles/application.scss';
import './styles/tailwind.css';

import './precheck';
import ready from './ready';
import { registerSW, lockSW } from './utils/sw';

if (BuildConfig.NODE_ENV === 'production') {
  printConsoleWarning();
  registerSW('/sw.js');
  lockSW();
}

ready(() => {
  const container = document.getElementById('plfe') as HTMLElement;
  const root = createRoot(container);

  root.render(<PlFe />);
});
