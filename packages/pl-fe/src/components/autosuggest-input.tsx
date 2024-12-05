import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

import AutosuggestEmoji from 'pl-fe/components/autosuggest-emoji';
import Icon from 'pl-fe/components/icon';
import Input from 'pl-fe/components/ui/input';
import Portal from 'pl-fe/components/ui/portal';
import AutosuggestAccount from 'pl-fe/features/compose/components/autosuggest-account';
import { textAtCursorMatchesToken } from 'pl-fe/utils/suggestions';

import AutosuggestLocation from './autosuggest-location';

import type { Location } from 'pl-api';
import type { Menu, MenuItem } from 'pl-fe/components/dropdown-menu';
import type { InputThemes } from 'pl-fe/components/ui/input';
import type { Emoji } from 'pl-fe/features/emoji';

type AutoSuggestion = string | Emoji | Location;

interface IAutosuggestInput extends Pick<React.HTMLAttributes<HTMLInputElement>, 'lang' | 'onChange' | 'onKeyUp' | 'onKeyDown'> {
  value: string;
  suggestions: Array<AutoSuggestion>;
  disabled?: boolean;
  placeholder?: string;
  onSuggestionSelected: (tokenStart: number, lastToken: string | null, suggestion: AutoSuggestion) => void;
  onSuggestionsClearRequested: () => void;
  onSuggestionsFetchRequested: (token: string) => void;
  autoFocus?: boolean;
  autoSelect?: boolean;
  className?: string;
  id?: string;
  searchTokens?: string[];
  maxLength?: number;
  menu?: Menu;
  hidePortal?: boolean;
  theme?: InputThemes;
}

const AutosuggestInput: React.FC<IAutosuggestInput> = ({
  autoFocus = false,
  autoSelect = true,
  searchTokens = ['@', ':', '#'],
  ...props
}) => {
  const getFirstIndex = () => autoSelect ? 0 : -1;

  const [suggestionsHidden, setSuggestionsHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(getFirstIndex());
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [tokenStart, setTokenStart] = useState<number | null>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const [tokenStart, token] = textAtCursorMatchesToken(
      e.target.value,
      e.target.selectionStart || 0,
      searchTokens,
    );

    if (token !== null && lastToken !== token) {
      setLastToken(token);
      setSelectedSuggestion(0);
      setTokenStart(tokenStart);
      props.onSuggestionsFetchRequested(token);
    } else if (token === null) {
      setLastToken(null);
      props.onSuggestionsClearRequested();
    }

    if (props.onChange) {
      props.onChange(e);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const { suggestions, menu, disabled } = props;
    const firstIndex = getFirstIndex();
    const lastIndex = suggestions.length + (menu || []).length - 1;

    if (disabled) {
      e.preventDefault();
      return;
    }

    if (e.which === 229) {
      // Ignore key events during text composition
      // e.key may be a name of the physical key even in this case (e.x. Safari / Chrome on Mac)
      return;
    }

    switch (e.key) {
      case 'Escape':
        if (suggestions.length === 0 || suggestionsHidden) {
          document.querySelector('.ui')?.parentElement?.focus();
        } else {
          e.preventDefault();
          setSuggestionsHidden(true);
        }

        break;
      case 'ArrowDown':
        if (!suggestionsHidden && (suggestions.length > 0 || menu)) {
          e.preventDefault();
          setSelectedSuggestion((selectedSuggestion) => Math.min(selectedSuggestion + 1, lastIndex));
        }

        break;
      case 'ArrowUp':
        if (!suggestionsHidden && (suggestions.length > 0 || menu)) {
          e.preventDefault();
          setSelectedSuggestion((selectedSuggestion) => Math.min(selectedSuggestion - 1, lastIndex));
        }

        break;
      case 'Enter':
      case 'Tab':
        // Select suggestion
        if (!suggestionsHidden && selectedSuggestion > -1 && (suggestions.length > 0 || menu)) {
          e.preventDefault();
          e.stopPropagation();
          setSelectedSuggestion(firstIndex);

          if (selectedSuggestion < suggestions.length) {
            props.onSuggestionSelected(tokenStart!, lastToken, suggestions[selectedSuggestion]);
          } else if (menu) {
            const item = menu[selectedSuggestion - suggestions.length];
            handleMenuItemAction(item, e);
          }
        }

        break;
    }

    if (e.defaultPrevented || !props.onKeyDown) {
      return;
    }

    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  const onBlur = () => {
    setSuggestionsHidden(true);
    setFocused(true);
  };

  const onFocus = () => {
    setFocused(true);
  };

  const onSuggestionClick: React.EventHandler<React.MouseEvent | React.TouchEvent> = (e) => {
    const index = Number(e.currentTarget?.getAttribute('data-index'));
    const suggestion = props.suggestions[index];
    props.onSuggestionSelected(tokenStart!, lastToken, suggestion);
    inputRef.current?.focus();
    e.preventDefault();
  };

  useEffect(() => {
    if (suggestionsHidden && focused) setSuggestionsHidden(false);
  }, [props.suggestions]);

  const renderSuggestion = (suggestion: AutoSuggestion, i: number) => {
    let inner, key;

    if (typeof suggestion === 'object' && 'origin_id' in suggestion) {
      inner = <AutosuggestLocation location={suggestion} />;
      key = suggestion.origin_id;
    } else if (typeof suggestion === 'object') {
      inner = <AutosuggestEmoji emoji={suggestion} />;
      key = suggestion.id;
    } else {
      inner = <AutosuggestAccount id={suggestion} />;
      key = suggestion;
    }

    return (
      <div
        role='button'
        tabIndex={0}
        key={key}
        data-index={i}
        className={clsx({
          'px-4 py-2.5 text-sm text-gray-700 dark:text-gray-500 focus:bg-gray-100 dark:focus:bg-primary-800 group': true,
          'hover:bg-gray-100 dark:hover:bg-gray-800': i !== selectedSuggestion,
          'bg-gray-100 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800': i === selectedSuggestion,
        })}
        onMouseDown={onSuggestionClick}
        onTouchEnd={onSuggestionClick}
      >
        {inner}
      </div>
    );
  };

  const handleMenuItemAction = (item: MenuItem | null, e: React.MouseEvent | React.KeyboardEvent) => {
    onBlur();
    if (item?.action) {
      item.action(e);
    }
  };

  const handleMenuItemClick = (item: MenuItem | null): React.MouseEventHandler => e => {
    e.preventDefault();
    handleMenuItemAction(item, e);
  };

  const renderMenu = () => {
    const { menu, suggestions } = props;

    if (!menu) {
      return null;
    }

    return menu.map((item, i) => (
      <a
        className={clsx('dark:focus:bg-primary-800 flex cursor-pointer items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800', {
          selected: suggestions.length - selectedSuggestion === i,
        })}
        href='#'
        role='button'
        tabIndex={0}
        onMouseDown={handleMenuItemClick(item)}
        key={i}
      >
        {item?.icon && (
          <Icon src={item.icon} />
        )}

        <span>{item?.text}</span>
      </a>
    ));
  };

  const setPortalPosition = () => {
    if (!inputRef.current) {
      return {};
    }

    const { top, height, left, width } = inputRef.current.getBoundingClientRect();

    return { left, width, top: top + height };
  };

  const visible = !suggestionsHidden && (props.suggestions.length || (props.menu && props.value));

  return [
    <div key='input' className='relative w-full'>
      <label className='sr-only'>{props.placeholder}</label>

      <Input
        type='text'
        className={props.className}
        outerClassName='mt-0'
        ref={inputRef}
        disabled={props.disabled}
        placeholder={props.placeholder}
        autoFocus={autoFocus}
        value={props.value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onKeyUp={props.onKeyUp}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-autocomplete='list'
        id={props.id}
        maxLength={props.maxLength}
        data-testid='autosuggest-input'
        theme={props.theme}
        lang={props.lang}
      />
    </div>,
    <Portal key='portal'>
      <div
        style={setPortalPosition()}
        className={clsx({
          'fixed w-full z-[1001] shadow bg-white dark:bg-gray-900 rounded-lg py-1 dark:ring-2 dark:ring-primary-700 focus:outline-none': true,
          hidden: !visible,
          block: visible,
        })}
      >
        <div className='space-y-0.5'>
          {props.suggestions.map(renderSuggestion)}
        </div>

        {renderMenu()}
      </div>
    </Portal>,
  ];
};

export { type AutoSuggestion, type IAutosuggestInput, AutosuggestInput as default };
