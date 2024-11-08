import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { translateStatus, undoStatusTranslation } from 'pl-fe/actions/statuses';
import { useTranslationLanguages } from 'pl-fe/api/hooks/instance/use-translation-languages';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useSettings } from 'pl-fe/hooks/use-settings';

import type { Status } from 'pl-fe/normalizers/status';

interface ITranslateButton {
  status: Pick<Status, 'id' | 'account' | 'content' | 'content_map' | 'language' | 'translating' | 'translation' | 'visibility'>;
}

const TranslateButton: React.FC<ITranslateButton> = ({ status }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();
  const instance = useInstance();
  const settings = useSettings();
  const autoTranslate = settings.autoTranslate;
  const knownLanguages = autoTranslate ? [...settings.knownLanguages, intl.locale] : [intl.locale];

  const me = useAppSelector((state) => state.me);
  const { translationLanguages } = useTranslationLanguages();

  const {
    allow_remote: allowRemote,
    allow_unauthenticated: allowUnauthenticated,
  } = instance.pleroma.metadata.translation;

  const renderTranslate = (me || allowUnauthenticated) && (allowRemote || status.account.local) && ['public', 'unlisted'].includes(status.visibility) && status.content.length > 0 && status.language !== null && intl.locale !== status.language && !status.content_map?.[intl.locale];

  const supportsLanguages = (translationLanguages[status.language!]?.includes(intl.locale));

  const handleTranslate: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (status.translation) {
      dispatch(undoStatusTranslation(status.id));
    } else {
      dispatch(translateStatus(status.id, intl.locale));
    }
  };

  useEffect(() => {
    if (status.translation === null && settings.autoTranslate && features.translations && renderTranslate && supportsLanguages && status.translation !== false && status.language !== null && !knownLanguages.includes(status.language)) {
      dispatch(translateStatus(status.id, intl.locale, true));
    }
  }, []);

  if (!features.translations || !renderTranslate || !supportsLanguages || status.translation === false) return null;

  const button = (
    <button className='w-fit' onClick={handleTranslate}>
      <HStack alignItems='center' space={1} className='text-primary-600 hover:underline dark:text-gray-600'>
        <Icon src={require('@fluentui/translate_24_regular.svg')} className='size-4' />
        <span>
          {status.translation ? (
            <FormattedMessage id='status.show_original' defaultMessage='Show original' />
          ) : status.translating ? (
            <FormattedMessage id='status.translating' defaultMessage='Translating…' />
          ) : (
            <FormattedMessage id='status.translate' defaultMessage='Translate' />
          )}
        </span>
        {status.translating && (
          <Icon src={require('@fluentui/spinner_ios_20_regular.svg')} className='size-4 animate-spin' />
        )}
      </HStack>
    </button>
  );

  if (status.translation) {
    const languageNames = new Intl.DisplayNames([intl.locale], { type: 'language' });
    const languageName = languageNames.of(status.language!);
    const provider = status.translation.provider;

    return (
      <Stack space={3} alignItems='start'>
        {button}
        <Text theme='muted'>
          <FormattedMessage
            id='status.translated_from_with'
            defaultMessage='Translated from {lang} {provider}'
            values={{
              lang: languageName,
              provider: provider ? <FormattedMessage id='status.translated_from_with.provider' defaultMessage='with {provider}' values={{ provider }} /> : undefined,
            }}
          />
        </Text>
      </Stack>
    );
  }

  return button;
};

export { TranslateButton as default };
