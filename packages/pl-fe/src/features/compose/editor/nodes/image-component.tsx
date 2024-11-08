/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /src/features/compose/editor directory.
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import clsx from 'clsx';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { mediaAttachmentSchema } from 'pl-api';
import * as React from 'react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import * as v from 'valibot';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import IconButton from 'pl-fe/components/ui/icon-button';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { useModalsStore } from 'pl-fe/stores/modals';

import { $isImageNode } from './image-node';

import type {
  BaseSelection,
  LexicalEditor,
  NodeKey,
} from 'lexical';

const messages = defineMessages({
  description: { id: 'upload_form.description', defaultMessage: 'Describe for the visually impaired' },
  descriptionMissingTitle: { id: 'upload_form.description_missing.title', defaultMessage: 'This attachment doesn\'t have a description' },
});

const imageCache = new Set();

const useSuspenseImage = (src: string) => {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        resolve(null);
      };
    });
  }
};

const LazyImage = ({
  altText,
  className,
  imageRef,
  src,
}: {
  altText: string;
  className: string | null;
  imageRef: {current: null | HTMLImageElement};
  src: string;
}): JSX.Element => {
  useSuspenseImage(src);
  return (
    <img
      className={className || undefined}
      src={src}
      alt={altText}
      ref={imageRef}
      draggable='false'
    />
  );
};

const ImageComponent = ({
  src,
  altText,
  nodeKey,
}: {
  altText: string;
  nodeKey: NodeKey;
  src: string;
}): JSX.Element => {
  const intl = useIntl();
  const { openModal } = useModalsStore();
  const { missingDescriptionModal } = useSettings();

  const imageRef = useRef<null | HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState<
    BaseSelection | null
  >(null);
  const activeEditorRef = useRef<LexicalEditor | null>(null);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dirtyDescription, setDirtyDescription] = useState<string | null>(null);

  const deleteNode = useCallback(
    () => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.remove();
        }
      });
    },
    [nodeKey],
  );

  const previewImage = () => {
    const image = v.parse(mediaAttachmentSchema, {
      id: '',
      type: 'image',
      url: src,
      altText,
    });

    openModal('MEDIA', { media: [image], index: 0 });
  };

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        deleteNode();
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  const onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;
      if (isSelected && $isNodeSelection(latestSelection) && latestSelection.getNodes().length === 1) {
        if (buttonElem !== null && buttonElem !== document.activeElement) {
          event.preventDefault();
          buttonElem.focus();
          return true;
        }
      }
      return false;
    },
    [isSelected],
  );

  const onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (buttonRef.current === event.target) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [editor, setSelected],
  );

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleInputBlur();
    }
  };

  const handleInputBlur = () => {
    setFocused(false);

    if (dirtyDescription !== null) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setAltText(dirtyDescription);
        }

        setDirtyDescription(null);
      });
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    setDirtyDescription(e.target.value);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleInputFocus = () => {
    setFocused(true);
  };

  const handleClick = () => {
    setFocused(true);
  };

  useEffect(() => {
    let isMounted = true;
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()));
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;

          if (event.target === imageRef.current) {
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelection();
              setSelected(true);
            }
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            // TODO This is just a temporary workaround for FF to behave like other browsers.
            // Ideally, this handles drag & drop too (and all browsers).
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        onEscape,
        COMMAND_PRIORITY_LOW,
      ),
    );
    return () => {
      isMounted = false;
      unregister();
    };
  }, [
    clearSelection,
    editor,
    isSelected,
    nodeKey,
    onDelete,
    onEnter,
    onEscape,
    setSelected,
  ]);

  const active = hovered || focused;
  const description = dirtyDescription || (dirtyDescription !== '' && altText) || '';
  const draggable = isSelected && $isNodeSelection(selection);

  return (
    <Suspense fallback={null}>
      <>
        <div className='relative' draggable={draggable} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick} role='button'>
          <HStack className='absolute right-2 top-2 z-10' space={2}>
            <IconButton
              onClick={previewImage}
              src={require('@tabler/icons/outline/zoom-in.svg')}
              theme='dark'
              className='!p-1.5 hover:scale-105 hover:bg-gray-900'
              iconClassName='h-5 w-5'
            />
            <IconButton
              onClick={deleteNode}
              src={require('@fluentui/dismiss_24_regular.svg')}
              theme='dark'
              className='!p-1.5 hover:scale-105 hover:bg-gray-900'
              iconClassName='h-5 w-5'
            />
          </HStack>

          <div
            className={clsx('absolute inset-x-0 bottom-0 z-[2px] bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900/80 p-2.5 opacity-0 transition-opacity duration-100 ease-linear', {
              'opacity-100': active,
            })}
          >
            <label>
              <span style={{ display: 'none' }}>{intl.formatMessage(messages.description)}</span>

              <textarea
                className='m-0 w-full rounded-md border border-solid border-white/25 bg-transparent p-2.5 text-sm text-white placeholder:text-white/60'
                placeholder={intl.formatMessage(messages.description)}
                value={description}
                onFocus={handleInputFocus}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
              />
            </label>
          </div>

          {missingDescriptionModal && !description && (
            <span
              title={intl.formatMessage(messages.descriptionMissingTitle)}
              className={clsx('absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded bg-gray-900 px-2 py-1 text-xs font-medium uppercase text-white transition-opacity duration-100 ease-linear', {
                'opacity-0 pointer-events-none': active,
                'opacity-100': !active,
              })}
            >
              <Icon className='size-4' src={require('@fluentui/warning_24_regular.svg')} />
              <FormattedMessage id='upload_form.description_missing.indicator' defaultMessage='Alt' />
            </span>
          )}

          <LazyImage
            className={
              clsx('mx-auto cursor-default', {
                'select-none': isSelected,
                'cursor-grab active:cursor-grabbing': isSelected && $isNodeSelection(selection),
              })
            }
            src={src}
            altText={altText}
            imageRef={imageRef}
          />
        </div>
      </>
    </Suspense>
  );
};

export default ImageComponent;
