import messages from 'pl-fe/messages';
import { useSettingsStore } from 'pl-fe/stores/settings';

/** Locales which should be presented in right-to-left. */
const RTL_LOCALES = ['ar', 'ckb', 'fa', 'he'];

/** Get valid locale from settings. */
const useLocale = (fallback = 'en') => {
  const localeWithVariant = useSettingsStore().settings.locale.replace('_', '-');
  const localeFirstPart = localeWithVariant.split('-')[0];
  return Object.keys(messages).includes(localeWithVariant) ? localeWithVariant : Object.keys(messages).includes(localeFirstPart) ? localeFirstPart : fallback;
};

const useLocaleDirection = (locale = 'en') => RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

export { useLocale, useLocaleDirection };
