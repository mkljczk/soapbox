import { staticFetch } from '../api';

import type { AppDispatch, RootState } from 'pl-fe/store';

const FETCH_ABOUT_PAGE_REQUEST = 'FETCH_ABOUT_PAGE_REQUEST' as const;
const FETCH_ABOUT_PAGE_SUCCESS = 'FETCH_ABOUT_PAGE_SUCCESS' as const;
const FETCH_ABOUT_PAGE_FAIL = 'FETCH_ABOUT_PAGE_FAIL' as const;

interface FetchAboutPageRequestAction {
  type: typeof FETCH_ABOUT_PAGE_REQUEST;
  slug: string;
  locale?: string;
}

interface FetchAboutPageSuccessAction {
  type: typeof FETCH_ABOUT_PAGE_SUCCESS;
  slug: string;
  locale?: string;
  html: string;
}

interface FetchAboutPageFailAction {
  type: typeof FETCH_ABOUT_PAGE_FAIL;
  slug: string;
  locale?: string;
  error: unknown;
}

const fetchAboutPage = (slug = 'index', locale?: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch({ type: FETCH_ABOUT_PAGE_REQUEST, slug, locale });

  const filename = `${slug}${locale ? `.${locale}` : ''}.html`;
  return staticFetch(`/instance/about/${filename}`)
    .then(({ data: html }) => {
      dispatch({ type: FETCH_ABOUT_PAGE_SUCCESS, slug, locale, html });
      return html;
    })
    .catch(error => {
      dispatch({ type: FETCH_ABOUT_PAGE_FAIL, slug, locale, error });
      throw error;
    });
};

type AboutAction =
  | FetchAboutPageRequestAction
  | FetchAboutPageSuccessAction
  | FetchAboutPageFailAction;

export {
  fetchAboutPage,
  FETCH_ABOUT_PAGE_REQUEST,
  FETCH_ABOUT_PAGE_SUCCESS,
  FETCH_ABOUT_PAGE_FAIL,
  type AboutAction,
};
