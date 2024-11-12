import clsx from 'clsx';
import { CLEAR_EDITOR_COMMAND, TextNode, type LexicalEditor } from 'lexical';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { length } from 'stringz';

import {
  submitCompose,
  clearComposeSuggestions,
  fetchComposeSuggestions,
  selectComposeSuggestion,
  uploadCompose,
} from 'pl-fe/actions/compose';
import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import EmojiPickerDropdown from 'pl-fe/features/emoji/containers/emoji-picker-dropdown-container';
import { ComposeEditor } from 'pl-fe/features/ui/util/async-components';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { useDraggedFiles } from 'pl-fe/hooks/use-dragged-files';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';

import QuotedStatusContainer from '../containers/quoted-status-container';
import ReplyIndicatorContainer from '../containers/reply-indicator-container';
import UploadButtonContainer from '../containers/upload-button-container';
import WarningContainer from '../containers/warning-container';
import { $createEmojiNode } from '../editor/nodes/emoji-node';
import { countableText } from '../util/counter';

import ContentTypeButton from './content-type-button';
import LanguageDropdown from './language-dropdown';
import PollButton from './poll-button';
import PollForm from './polls/poll-form';
import PrivacyDropdown from './privacy-dropdown';
import ReplyGroupIndicator from './reply-group-indicator';
import ReplyMentions from './reply-mentions';
import ScheduleButton from './schedule-button';
import ScheduleForm from './schedule-form';
import SensitiveMediaButton from './sensitive-media-button';
import SpoilerInput from './spoiler-input';
import TextCharacterCounter from './text-character-counter';
import UploadForm from './upload-form';
import VisualCharacterCounter from './visual-character-counter';
import Warning from './warning';

import type { AutoSuggestion } from 'pl-fe/components/autosuggest-input';
import type { Emoji } from 'pl-fe/features/emoji';

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: 'What\'s on your mind?' },
  pollPlaceholder: { id: 'compose_form.poll_placeholder', defaultMessage: 'Add a poll topic…' },
  eventPlaceholder: { id: 'compose_form.event_placeholder', defaultMessage: 'Post to this event' },
  publish: { id: 'compose_form.publish', defaultMessage: 'Post' },
  publishLoud: { id: 'compose_form.publish_loud', defaultMessage: '{publish}!' },
  message: { id: 'compose_form.message', defaultMessage: 'Message' },
  schedule: { id: 'compose_form.schedule', defaultMessage: 'Schedule' },
  saveChanges: { id: 'compose_form.save_changes', defaultMessage: 'Save changes' },
});

interface IComposeForm<ID extends string> {
  id: ID extends 'default' ? never : ID;
  shouldCondense?: boolean;
  autoFocus?: boolean;
  clickableAreaRef?: React.RefObject<HTMLDivElement>;
  event?: string;
  group?: string;
  withAvatar?: boolean;
  transparent?: boolean;
}

const ComposeForm = <ID extends string>({ id, shouldCondense, autoFocus, clickableAreaRef, event, group, withAvatar, transparent }: IComposeForm<ID>) => {
  const history = useHistory();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { configuration } = useInstance();

  const compose = useCompose(id);
  const maxTootChars = configuration.statuses.max_characters;
  const features = useFeatures();

  const {
    spoiler_text: spoilerText,
    privacy,
    is_submitting: isSubmitting,
    is_changing_upload:
    isChangingUpload,
    is_uploading: isUploading,
    schedule: scheduledAt,
    group_id: groupId,
    text,
    modified_language: modifiedLanguage,
  } = compose;

  const hasPoll = !!compose.poll;
  const isEditing = compose.id !== null;
  const anyMedia = compose.media_attachments.size > 0;

  const [composeFocused, setComposeFocused] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<LexicalEditor>(null);

  const { isDraggedOver } = useDraggedFiles(formRef);

  const fulltext = [spoilerText, countableText(text)].join('');

  const isEmpty = !(fulltext.trim() || anyMedia);
  const condensed = shouldCondense && !isDraggedOver && !composeFocused && isEmpty && !isUploading;
  const shouldAutoFocus = autoFocus;
  const canSubmit = !!editorRef.current && !isSubmitting && !isUploading && !isChangingUpload && !isEmpty && length(fulltext) <= maxTootChars;

  const getClickableArea = () => clickableAreaRef ? clickableAreaRef.current : formRef.current;

  const isClickOutside = (e: MouseEvent | React.MouseEvent) => ![
    // List of elements that shouldn't collapse the composer when clicked
    // FIXME: Make this less brittle
    getClickableArea(),
    document.getElementById('privacy-dropdown'),
    document.querySelector('em-emoji-picker'),
    document.getElementById('modal-overlay'),
  ].some(element => element?.contains(e.target as any));

  const handleClick = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (isEmpty && isClickOutside(e)) {
      handleClickOutside();
    }
  }, [isEmpty]);

  const handleClickOutside = () => {
    setComposeFocused(false);
  };

  const handleComposeFocus = () => {
    setComposeFocused(true);
  };

  const handleSubmit = (e?: React.FormEvent<Element>) => {
    if (!canSubmit) return;
    e?.preventDefault();

    dispatch(submitCompose(id, { history, onSuccess: () => {
      editorRef.current?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
    } }));
  };

  const onSuggestionsClearRequested = () => {
    dispatch(clearComposeSuggestions(id));
  };

  const onSuggestionsFetchRequested = (token: string | number) => {
    dispatch(fetchComposeSuggestions(id, token as string));
  };

  const onSpoilerSuggestionSelected = (tokenStart: number, token: string | null, value: AutoSuggestion) => {
    dispatch(selectComposeSuggestion(id, tokenStart, token, value, ['spoiler_text']));
  };

  const handleEmojiPick = (data: Emoji) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.update(() => {
      editor.getEditorState()._selection?.insertNodes([$createEmojiNode(data), new TextNode(' ')]);
    });
  };

  const onPaste = (files: FileList) => {
    dispatch(uploadCompose(id, files, intl));
  };

  useEffect(() => {
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  const renderButtons = useCallback(() => (
    <HStack alignItems='center' space={2}>
      <UploadButtonContainer composeId={id} />
      <EmojiPickerDropdown onPickEmoji={handleEmojiPick} condensed={shouldCondense} />
      {features.polls && <PollButton composeId={id} />}
      {features.scheduledStatuses && <ScheduleButton composeId={id} />}
      {anyMedia && features.spoilers && <SensitiveMediaButton composeId={id} />}
    </HStack>
  ), [features, id, anyMedia]);

  const showModifiers = !condensed && (compose.media_attachments.size || compose.is_uploading || compose.poll?.options.size || compose.schedule);

  const composeModifiers = showModifiers && (
    <Stack space={4} className='font-[inherit] text-sm text-gray-900'>
      <UploadForm composeId={id} onSubmit={handleSubmit} />
      <PollForm composeId={id} />
      <ScheduleForm composeId={id} />
    </Stack>
  );

  let publishText: string | JSX.Element = '';
  let publishIcon: string | undefined = undefined;

  if (isEditing) {
    publishText = intl.formatMessage(messages.saveChanges);
  } else if (privacy === 'direct') {
    publishIcon = require('@tabler/icons/outline/mail.svg');
    publishText = intl.formatMessage(messages.message);
  } else if (privacy === 'private' || privacy === 'mutuals_only') {
    publishIcon = require('@tabler/icons/outline/lock.svg');
    publishText = intl.formatMessage(messages.publish);
  } else {
    publishText = privacy !== 'unlisted' ? intl.formatMessage(messages.publishLoud, { publish: intl.formatMessage(messages.publish) }) : intl.formatMessage(messages.publish);
  }

  if (scheduledAt) {
    publishText = intl.formatMessage(messages.schedule);
  }

  const selectButtons = [];

  if (features.privacyScopes && !group && !groupId) selectButtons.push(<PrivacyDropdown key='privacy-dropdown' composeId={id} />);
  if (features.richText) selectButtons.push(<ContentTypeButton key='compose-type-button' composeId={id} />);
  if (features.postLanguages) selectButtons.push(<LanguageDropdown key='language-dropdown' composeId={id} />);

  return (
    <Stack className='w-full' space={4} ref={formRef} onClick={handleClick} element='form' onSubmit={handleSubmit}>
      {!!compose.in_reply_to && compose.approvalRequired && (
        <Warning
          message={(
            <FormattedMessage id='compose_form.approval_required' defaultMessage='The reply needs to be approved by the post author.' />
          )}
        />
      )}

      <WarningContainer composeId={id} />

      {!shouldCondense && !event && !group && groupId && <ReplyGroupIndicator composeId={id} />}

      {!shouldCondense && !event && !group && <ReplyIndicatorContainer composeId={id} />}

      {!shouldCondense && !event && !group && <ReplyMentions composeId={id} />}

      {!!selectButtons && (
        <HStack space={2} wrap className={clsx(transparent && '-mb-2')}>
          {selectButtons}
        </HStack>
      )}

      {features.spoilers && (
        <SpoilerInput
          composeId={id}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          onSuggestionSelected={onSpoilerSuggestionSelected}
          theme={transparent ? 'transparent' : 'normal'}
        />
      )}

      <div>
        <Suspense>
          <ComposeEditor
            key={modifiedLanguage}
            ref={editorRef}
            className={transparent
              ? ''
              : 'rounded-md border-gray-400 px-3 py-2 ring-2 focus-within:border-primary-500 focus-within:ring-primary-500 dark:border-gray-800 dark:ring-gray-800 dark:focus-within:border-primary-500 dark:focus-within:ring-primary-500'}
            placeholderClassName={transparent ? '' : 'pt-2'}
            composeId={id}
            condensed={condensed}
            eventDiscussion={!!event}
            autoFocus={shouldAutoFocus}
            hasPoll={hasPoll}
            handleSubmit={handleSubmit}
            onFocus={handleComposeFocus}
            onPaste={onPaste}
          />
        </Suspense>
      </div>

      {composeModifiers}

      <QuotedStatusContainer composeId={id} />

      <div
        className={clsx('flex flex-wrap items-center justify-between', {
          'hidden': condensed,
          'ml-[-56px] sm:ml-0': withAvatar,
        })}
      >
        {renderButtons()}

        <HStack space={4} alignItems='center' className='ml-auto rtl:ml-0 rtl:mr-auto'>
          {maxTootChars && (
            <HStack space={1} alignItems='center'>
              <TextCharacterCounter max={maxTootChars} text={text} />
              <VisualCharacterCounter max={maxTootChars} text={text} />
            </HStack>
          )}

          <Button type='submit' theme='primary' icon={publishIcon} text={publishText} disabled={!canSubmit} />
        </HStack>
      </div>
    </Stack>
  );
};

export { ComposeForm as default };
