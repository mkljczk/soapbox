import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Text from 'pl-fe/components/ui/text';
import { type Language, languages } from 'pl-fe/features/preferences';
import { useStatusMetaStore } from 'pl-fe/stores/status-meta';

import DropdownMenu from './dropdown-menu';

import type { Status } from 'pl-fe/normalizers/status';

const messages = defineMessages({
  languageVersions: { id: 'status.language_versions', defaultMessage: 'The post has multiple language versions.' },
});

interface IStatusLanguagePicker {
  status: Pick<Status, 'id' | 'content_map'>;
  showLabel?: boolean;
}

const StatusLanguagePicker: React.FC<IStatusLanguagePicker> = React.memo(({ status, showLabel }) => {
  const intl = useIntl();

  const { statuses, setStatusLanguage } = useStatusMetaStore();

  const { currentLanguage } = statuses[status.id] || {};

  if (!status.content_map || Object.keys(status.content_map).length < 2) return null;

  const icon = <Icon className='size-4 text-gray-700 dark:text-gray-600' src={require('@tabler/icons/outline/language.svg')} />;

  return (
    <>
      <Text tag='span' theme='muted' size='sm'>&middot;</Text>

      <DropdownMenu
        items={Object.keys(status.content_map).map((language) => ({
          text: languages[language as Language] || language,
          action: () => setStatusLanguage(status.id, language),
          active: language === currentLanguage,
        }))}
      >
        <button title={intl.formatMessage(messages.languageVersions)} className='hover:underline'>
          {showLabel ? (
            <HStack space={1} alignItems='center'>
              {icon}
              <Text tag='span' theme='muted' size='sm'>
                {languages[currentLanguage as Language] || currentLanguage}
              </Text>
            </HStack>
          ) : icon}
        </button>
      </DropdownMenu>
    </>
  );
});

export {
  StatusLanguagePicker as default,
};
