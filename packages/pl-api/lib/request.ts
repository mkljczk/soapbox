import LinkHeader from 'http-link-header';
import { serialize } from 'object-to-formdata';

import PlApiClient from './client';
import { buildFullPath } from './utils/url';

type Response<T = any> = {
  headers: Headers;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  type: ResponseType;
  url: string;
  data: string;
  json: T;
};

/**
  Parse Link headers, mostly for pagination.
  @param {object} response - Fetch API response object
  @returns {object} Link object
  */
const getLinks = (response: Pick<Response, 'headers'>): LinkHeader =>
  new LinkHeader(response.headers?.get('link') || undefined);

const getNextLink = (response: Pick<Response, 'headers'>): string | null =>
  getLinks(response).refs.find(link => link.rel.toLocaleLowerCase() === 'next')?.uri || null;

const getPrevLink = (response: Pick<Response, 'headers'>): string | null =>
  getLinks(response).refs.find(link => link.rel.toLocaleLowerCase() === 'prev')?.uri || null;

interface RequestBody<Params = Record<string, any>> {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: any;
  params?: Params;
  onUploadProgress?: (e: ProgressEvent) => void;
  signal?: AbortSignal;
  contentType?: string;
  idempotencyKey?: string;
}

type RequestMeta = Pick<RequestBody, 'idempotencyKey' | 'onUploadProgress' | 'signal'>;

function request<T = any>(this: Pick<PlApiClient, 'accessToken' | 'baseURL'>, input: URL | RequestInfo, {
  body,
  method = body ? 'POST' : 'GET',
  params,
  onUploadProgress,
  signal,
  contentType = 'application/json',
  idempotencyKey,
}: RequestBody = {}) {
  const fullPath = buildFullPath(input.toString(), this.baseURL, params);
  const headers = new Headers();

  if (this.accessToken) headers.set('Authorization', `Bearer ${this.accessToken}`);
  if (contentType !== '') headers.set('Content-Type', contentType);
  if (idempotencyKey) headers.set('Idempotency-Key', contentType);

  body = body && contentType === '' ? serialize(body, { indices: true }) : JSON.stringify(body);

  // Fetch API doesn't report upload progress, use XHR
  if (onUploadProgress) {
    return new Promise<Response<T>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.addEventListener('progress', onUploadProgress!);
      xhr.addEventListener('loadend', () => {
        const data = xhr.response;
        let json: T = undefined!;

        if (xhr.getResponseHeader('content-type')?.includes('application/json')) {
          try {
            json = JSON.parse(data);
          } catch (e) {
          //
          }
        }

        if (xhr.status >= 400) reject({ response: {
          status: xhr.status,
          statusText: xhr.statusText,
          url: xhr.responseURL,
          data,
          json,

        } });
        resolve({ status: xhr.status, data, json } as any as Response<T>);
      });

      xhr.open(method, fullPath, true);
      headers.forEach((value, key) => xhr.setRequestHeader(key, value));
      xhr.responseType = 'text';
      xhr.send(body as FormData);
    });
  }

  return fetch(fullPath, {
    method,
    headers,
    body,
    signal,
  }).then(async (res) => {
    const data = await res.text();

    let json: T = undefined!;

    if (res.headers.get('content-type')?.includes('application/json')) {
      try {
        json = JSON.parse(data);
      } catch (e) {
        //
      }
    }

    const { headers, ok, redirected, status, statusText, type, url } = res;

    const response = { headers, ok, redirected, status, statusText, type, url, data, json };

    if (!ok) {
      throw { response };
    }
    return response as any as Response<T>;
  });
}

export {
  type Response,
  type RequestBody,
  type RequestMeta,
  getLinks,
  getNextLink,
  getPrevLink,
  request,
  request as default,
};
