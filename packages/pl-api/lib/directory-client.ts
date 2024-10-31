import * as v from 'valibot';

import { directoryCategorySchema } from './entities/directory/category';
import { directoryLanguageSchema } from './entities/directory/language';
import { directoryServerSchema } from './entities/directory/server';
import { directoryStatisticsPeriodSchema } from './entities/directory/statistics-period';
import { filteredArray } from './entities/utils';
import request from './request';

interface Params {
  language?: string;
  category?: string;
  region?: 'europe' | 'north_america' | 'south_america' | 'africa' | 'asia' | 'oceania';
  ownership?: 'juridicial' | 'natural';
  registrations?: 'instant' | 'manual';
}

/**
 * @category Clients
 */
class PlApiDirectoryClient {

  accessToken = undefined;
  baseURL: string;
  public request = request.bind(this) as typeof request;

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
