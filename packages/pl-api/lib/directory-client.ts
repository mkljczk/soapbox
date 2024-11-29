import * as v from 'valibot';

import { directoryCategorySchema } from './entities/directory/category';
import { directoryLanguageSchema } from './entities/directory/language';
import { directoryServerSchema } from './entities/directory/server';
import { directoryStatisticsPeriodSchema } from './entities/directory/statistics-period';
import { filteredArray } from './entities/utils';
import request from './request';

interface Params {
  /** ISO 639 language code for servers. */
  language?: string;
  /** Server topic. */
  category?: string;
  /** Region where teh server is legally based. */
  region?: 'europe' | 'north_america' | 'south_america' | 'africa' | 'asia' | 'oceania';
  /** Whether the server is governed by a public organization or a private individual. */
  ownership?: 'juridicial' | 'natural';
  /** Whether the registrations are currently open. */
  registrations?: 'instant' | 'manual';
}

/**
 * @category Clients
 * 
 * joinmastodon.org-compatible server directory client.
 */
class PlApiDirectoryClient {

  /** Unused. */
  accessToken: string | undefined = undefined;
  /**
   * Server directory URL.
   */
  baseURL: string;
  public request = request.bind(this) as typeof request;

  /**
   * @param baseURL Server directory URL. e.g. `https://joinmastodon.org`
   */
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getStatistics() {
    const response = await this.request('/statistics');

    return v.parse(filteredArray(directoryStatisticsPeriodSchema), response.json);
  }

  async getCategories(params?: Params) {
    const response = await this.request('/categories', { params });

    return v.parse(filteredArray(directoryCategorySchema), response.json);
  }

  async getLanguages(params?: Params) {
    const response = await this.request('/categories', { params });

    return v.parse(filteredArray(directoryLanguageSchema), response.json);
  }

  async getServers(params?: Params) {
    const response = await this.request('/servers', { params });

    return v.parse(filteredArray(directoryServerSchema), response.json);
  }

}

export {
  PlApiDirectoryClient,
  PlApiDirectoryClient as default,
};
