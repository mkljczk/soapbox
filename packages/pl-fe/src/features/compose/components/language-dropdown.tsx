import clsx from 'clsx';
import fuzzysort from 'fuzzysort';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { addComposeLanguage, changeComposeLanguage, changeComposeModifiedLanguage, deleteComposeLanguage } from 'pl-fe/actions/compose';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import Button from 'pl-fe/components/ui/button';
import Icon from 'pl-fe/components/ui/icon';
import Input from 'pl-fe/components/ui/input';
import { type Language, languages as languagesObject } from 'pl-fe/features/preferences';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useSettings } from 'pl-fe/hooks/use-settings';

const getFrequentlyUsedLanguages = (languageCounters: Record<string, number>) => (
  Object.keys(languageCounters)
    .toSorted((a, b) => languageCounters[a] - languageCounters[b])
    .toReversed()
);

const languages = Object.entries(languagesObject) as Array<[Language, string]>;

const messages = defineMessages({
  languagePrompt: { id: 'compose.language_dropdown.prompt', defaultMessage: 'Select language' },
  languageSuggestion: { id: 'compose.language_dropdown.suggestion', defaultMessage: '{language} (detected)' },
  multipleLanguages: { id: 'compose.language_dropdown.more_languages', defaultMessage: '{count, plural, one {# more language} other {# more languages}}' },
  search: { id: 'compose.language_dropdown.search', defaultMessage: 'Search language…' },
  addLanguage: { id: 'compose.language_dropdown.add_language', defaultMessage: 'Add language' },
  deleteLanguage: { id: 'compose.language_dropdown.delete_language', defaultMessage: 'Delete language' },
});

interface ILanguageDropdown {
  handleClose: () => any;
}

const getLanguageDropdown = (composeId: string): React.FC<ILanguageDropdown> => ({ handleClose: handleMenuClose }) => {
  const intl = useIntl();
  const features = useFeatures();
  const dispatch = useAppDispatch();
  const settings = useSettings();
  const frequentlyUsedLanguages = useMemo(() => getFrequentlyUsedLanguages(settings.frequentlyUsedLanguages), [settings.frequentlyUsedLanguages]);

  const node = useRef<HTMLDivElement>(null);
  const focusedItem = useRef<HTMLButtonElement>(null);

  const [searchValue, setSearchValue] = useState('');

  const {
    language,
    modified_language: modifiedLanguage,
    textMap,
  } = useCompose(composeId);

  const hasMultipleLanguages = !!Object.keys(textMap).length;

  const handleOptionClick: React.EventHandler<any> = (e: MouseEvent | KeyboardEvent) => {
    const value = (e.currentTarget as HTMLElement)?.getAttribute('data-index') as Language;

    if (Object.keys(textMap).length) {
      if (!(value in textMap || language === value)) return;

      dispatch(changeComposeModifiedLanguage(composeId, value));
    } else {
      dispatch(changeComposeLanguage(composeId, value));
    }

    e.preventDefault();

    handleClose();
  };

  const handleAddLanguageClick: React.EventHandler<any> = (e: MouseEvent | KeyboardEvent) => {
    const value = (e.currentTarget as HTMLElement)?.parentElement?.getAttribute('data-index') as Language;

    e.preventDefault();
    e.stopPropagation();

    dispatch(addComposeLanguage(composeId, value));
  };

  const handleDeleteLanguageClick: React.EventHandler<any> = (e: MouseEvent | KeyboardEvent) => {
    const value = (e.currentTarget as HTMLElement)?.parentElement?.getAttribute('data-index') as Language;

    e.preventDefault();
    e.stopPropagation();

    dispatch(deleteComposeLanguage(composeId, value));
  };

  const handleClear: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setSearchValue('');
  };

  const search = () => {
    if (searchValue === '') {
      return [...languages].sort((a, b) => {
        // Push current selection to the top of the list

        if (a[0] in textMap) {
          if (b[0] === language) return 1;
          return -1;
        }
        if (b[0] in textMap) {
          if (a[0] === language) return -1;
          return 1;
        }
        if (a[0] === language) {
          return -1;
        } else if (b[0] === language) {
          return 1;
        } else {
          // Sort according to frequently used languages

          const indexOfA = frequentlyUsedLanguages.indexOf(a[0]);
          const indexOfB = frequentlyUsedLanguages.indexOf(b[0]);

          return ((indexOfA > -1 ? indexOfA : Infinity) - (indexOfB > -1 ? indexOfB : Infinity));
        }
      });
    }

    return fuzzysort.go(searchValue, languages, {
      keys: ['0', '1'],
      limit: 5,
      threshold: -10000,
    }).map(result => result.obj);
  };

  const handleClose = () => {
    setSearchValue('');
    handleMenuClose();
  };

  useEffect(() => {
    if (node.current) {
      (node.current?.querySelector('div[aria-selected=true]') as HTMLDivElement)?.focus();
    }
  }, [node.current]);

  const isSearching = searchValue !== '';
  const results = search();

  return (
    <>
      <label className='relative block grow p-2 pt-1'>
        <span style={{ display: 'none' }}>{intl.formatMessage(messages.search)}</span>

        <Input
          className='w-64'
          type='text'
          value={searchValue}
          onChange={({ target }) => setSearchValue(target.value)}
          outerClassName='mt-0'
          placeholder={intl.formatMessage(messages.search)}
        />
        <div role='button' tabIndex={0} className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-5 rtl:left-0 rtl:right-auto' onClick={handleClear}>
          <Icon
            className='size-5 text-gray-600'
            src={isSearching ? require('@tabler/icons/outline/backspace.svg') : require('@tabler/icons/outline/search.svg')}
            aria-label={intl.formatMessage(messages.search)}
          />
        </div>
      </label>
      <div className='-mb-1 h-96 w-full overflow-auto' ref={node} tabIndex={-1}>
        {results.map(([code, name]) => {
          const active = code === language;
          const modified = code === modifiedLanguage;

          return (
            <button
              role='option'
              tabIndex={0}
              key={code}
              data-index={code}
              onClick={handleOptionClick}
              className={clsx(
                'flex w-full gap-2 p-2.5 text-left text-sm text-gray-700 dark:text-gray-400',
                {
                  'bg-gray-100 dark:bg-gray-800 black:bg-gray-900 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700': modified,
                  'cursor-pointer hover:bg-gray-100 black:hover:bg-gray-900 dark:hover:bg-gray-800': !hasMultipleLanguages || code in textMap,
                  'cursor-pointer': active,
                  'cursor-default': !active && !(!hasMultipleLanguages || code in textMap),
                },
              )}
              aria-selected={active}
              ref={active ? focusedItem : null}
            >
              <div
                className={clsx('text-primary-600 dark:text-primary-400 flex-auto grow', {
                  'text-black dark:text-white': modified,
                })}
              >
                {name}
              </div>
              {features.multiLanguage && !!language && !active && (
                code in textMap ? (
                  <button title={intl.formatMessage(messages.deleteLanguage)} onClick={handleDeleteLanguageClick}>
                    <Icon className='size-4' src={require('@tabler/icons/outline/minus.svg')} />
                  </button>
                ) : (
                  <button title={intl.formatMessage(messages.addLanguage)} onClick={handleAddLanguageClick}>
                    <Icon className='size-4' src={require('@tabler/icons/outline/plus.svg')} />
                  </button>
                )
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

interface ILanguageDropdownButton {
  composeId: string;
}

const LanguageDropdownButton: React.FC<ILanguageDropdownButton> = ({ composeId }) => {
  const intl = useIntl();

  const {
    language,
    modified_language: modifiedLanguage,
    suggested_language: suggestedLanguage,
    textMap,
  } = useCompose(composeId);

  const languagesCount = Object.keys(textMap).length;

  let buttonLabel = intl.formatMessage(messages.languagePrompt);
  if (language) {
    const list: string[] = [languagesObject[modifiedLanguage || language]];
    if (languagesCount) list.push(intl.formatMessage(messages.multipleLanguages, {
      count: languagesCount,
    }));
    buttonLabel = intl.formatList(list);
  } else if (suggestedLanguage) buttonLabel = intl.formatMessage(messages.languageSuggestion, {
    language: languagesObject[suggestedLanguage as Language] || suggestedLanguage,
  });

  const LanguageDropdown = useMemo(() => getLanguageDropdown(composeId), [composeId]);

  return (
    <DropdownMenu
      component={LanguageDropdown}
    >
      <Button
        theme='muted'
        size='xs'
        text={buttonLabel}
        icon={require('@tabler/icons/outline/language.svg')}
        secondaryIcon={require('@tabler/icons/outline/chevron-down.svg')}
        title={intl.formatMessage(messages.languagePrompt)}
      />
    </DropdownMenu>
  );

};

export { LanguageDropdownButton as default };
