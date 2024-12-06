import { usePlFeConfig } from './use-pl-fe-config';
import { useSettings } from './use-settings';
import { useTheme } from './use-theme';

const useLogo = () => {
  const { logo, logoDarkMode } = usePlFeConfig();
  const { demo } = useSettings();

  const darkMode = ['dark', 'black'].includes(useTheme());

  // Use the right logo if provided, otherwise return null;
  const src = (darkMode && logoDarkMode)
    ? logoDarkMode
    : logo || logoDarkMode;

  if (demo) return null;

  return src;
};

export { useLogo };
