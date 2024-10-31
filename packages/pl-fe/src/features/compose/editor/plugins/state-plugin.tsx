import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createRemarkExport } from '@mkljczk/lexical-remark';
import { $getRoot } from 'lexical';
import debounce from 'lodash/debounce';
import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';

import { addSuggestedLanguage, addSuggestedQuote, setEditorState } from 'pl-fe/actions/compose';
import { fetchStatus } from 'pl-fe/actions/statuses';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { getStatusIdsFromLinksInContent } from 'pl-fe/utils/status';

import type { LanguageIdentificationModel } from 'fasttext.wasm.js/dist/models/language-identification/common.js';

let lidModel: LanguageIdentificationModel;

interface IStatePlugin {
  composeId: string;
  isWysiwyg?: boolean;
}

const StatePlugin: React.FC<IStatePlugin> = ({ composeId, isWysiwyg }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [editor] = useLexicalComposerContext();
  const features = useFeatures();

  const getQuoteSuggestions = useCallback(debounce((text: string) => {
    dispatch(async (_, getState) => {
      const state = getState();
      const compose = state.compose.get(composeId);

      if (!features.quotePosts || compose?.quote) return;

      const ids = getStatusIdsFromLinksInContent(text);

      let quoteId: string | undefined;

      for (const id of ids) {
        if (compose?.dismissed_quotes.includes(id)) continue;

        if (state.statuses.get(id)) {
          quoteId = id;
          break;
        }

        const status = await dispatch(fetchStatus(id, intl));

        if (status) {
          quoteId = status.id;
          break;
        }
      }

      if (quoteId) dispatch(addSuggestedQuote(composeId, quoteId));
    });
  }, 2000), []);

  const detectLanguage = useCallback(debounce(async (text: string) => {
    dispatch(async (dispatch, getState) => {
      const state = getState();
      const compose = state.compose.get(composeId);

      if (!features.postLanguages || features.languageDetection || compose?.language) return;

      const wordsLength = text.split(/\s+/).length;

      if (wordsLength < 4) return;

      if (!lidModel) {
        // eslint-disable-next-line import/extensions
        const { getLIDModel } = await import('fasttext.wasm.js/common');
        lidModel = await getLIDModel();
      }
      if (!lidModel.model) await lidModel.load();
      const { alpha2, possibility } = await lidModel.identify(text.replace(/\s+/i, ' '));

      if (alpha2 && possibility > 0.5) {
        dispatch(addSuggestedLanguage(composeId, alpha2));
      }
    });
  }, 750), []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      const plainText = editorState.read(() => $getRoot().getTextContent());
      let text = plainText;
      if (isWysiwyg) {
        text = editorState.read($createRemarkExport({
          handlers: {
            hashtag: (node) => ({ type: 'text', value: node.getTextContent() }),
            mention: (node) => ({ type: 'text', value: node.getTextContent() }),
          },
        }));
      }
      const isEmpty = text === '';
      const data = isEmpty ? null : JSON.stringify(editorState.toJSON());
      dispatch(setEditorState(composeId, data, text));
      getQuoteSuggestions(plainText);
      detectLanguage(plainText);
    });
  }, [editor]);

  return null;
};

export { StatePlugin as default };
