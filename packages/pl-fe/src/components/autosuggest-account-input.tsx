import throttle from 'lodash/throttle';
import React, { useState, useRef, useCallback, useEffect } from 'react';

import { accountSearch } from 'pl-fe/actions/accounts';
import AutosuggestInput, { AutoSuggestion } from 'pl-fe/components/autosuggest-input';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

import type { Menu } from 'pl-fe/components/dropdown-menu';
import type { InputThemes } from 'pl-fe/components/ui/input';

const noOp = () => { };

interface IAutosuggestAccountInput {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSelected: (accountId: string) => void;
  autoFocus?: boolean;
  value: string;
  className?: string;
  autoSelect?: boolean;
  menu?: Menu;
  onKeyDown?: React.KeyboardEventHandler;
  theme?: InputThemes;
}

const AutosuggestAccountInput: React.FC<IAutosuggestAccountInput> = ({
  onChange,
  onSelected,
  value = '',
  ...rest
}) => {
  const dispatch = useAppDispatch();
  const [accountIds, setAccountIds] = useState(Array<string>());
  const controller = useRef(new AbortController());

  const refreshCancelToken = () => {
    controller.current.abort();
    controller.current = new AbortController();
  };

  const clearResults = () => {
    setAccountIds([]);
  };

  const handleAccountSearch = useCallback(throttle((q) => {
    dispatch(accountSearch(q, controller.current.signal))
      .then((accounts: { id: string }[]) => {
        const accountIds = accounts.map(account => account.id);
        setAccountIds(accountIds);
      })
      .catch(noOp);
  }, 900, { leading: true, trailing: true }), []);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    refreshCancelToken();
    handleAccountSearch(e.target.value);
    onChange(e);
  };

  const handleSelected = (_tokenStart: number, _lastToken: string | null, suggestion: AutoSuggestion) => {
    if (typeof suggestion === 'string' && suggestion[0] !== '#') {
      onSelected(suggestion);
    }
  };

  useEffect(() => {
    if (rest.autoFocus) {
      handleAccountSearch('');
    }
  }, []);

  useEffect(() => {
    if (value === '') {
      clearResults();
    }
  }, [value]);

  return (
    <AutosuggestInput
      value={value}
      onChange={handleChange}
      suggestions={accountIds}
      onSuggestionsFetchRequested={noOp}
      onSuggestionsClearRequested={noOp}
      onSuggestionSelected={handleSelected}
      searchTokens={[]}
      {...rest}
    />
  );
};

export { AutosuggestAccountInput as default };
