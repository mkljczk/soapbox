import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeComposeSpoilerText } from 'pl-fe/actions/compose';
import AutosuggestInput, { IAutosuggestInput } from 'pl-fe/components/autosuggest-input';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';

const messages = defineMessages({
  placeholder: { id: 'compose_form.spoiler_placeholder', defaultMessage: 'Subject (optional)' },
});

interface ISpoilerInput extends Pick<IAutosuggestInput, 'onSuggestionsFetchRequested' | 'onSuggestionsClearRequested' | 'onSuggestionSelected' | 'theme'> {
  composeId: string extends 'default' ? never : string;
}

/** Text input for content warning in composer. */
const SpoilerInput: React.FC<ISpoilerInput> = ({
  composeId,
  onSuggestionsFetchRequested,
  onSuggestionsClearRequested,
  onSuggestionSelected,
  theme,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { language, modified_language, spoiler_text: spoilerText, spoilerTextMap, suggestions } = useCompose(composeId);

  const handleChangeSpoilerText: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    dispatch(changeComposeSpoilerText(composeId, e.target.value));
  };

  const value = !modified_language || modified_language === language ? spoilerText : spoilerTextMap.get(modified_language, '');

  return (
    <AutosuggestInput
      placeholder={intl.formatMessage(messages.placeholder)}
      value={value}
      onChange={handleChangeSpoilerText}
      suggestions={suggestions.toArray()}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      onSuggestionSelected={onSuggestionSelected}
      theme={theme}
      searchTokens={[':']}
      id='cw-spoiler-input'
      className='rounded-md !bg-transparent dark:!bg-transparent'
    />
  );
};

export { SpoilerInput as default };
