import { ICacheBackend } from './types';

export type Strategy = 'api_first' | 'cache_first';

export interface IDataWithCacheParams {
    strategy: Strategy;
    cache: ICacheBackend;
    objectType: string;
    objectId: string;
    getData: () => Promise<any>;
    apiTimeout?: number;
    cacheTimeout?: number;
    cacheExpires?: number;
}

export class DataWithCache {
    constructor(
        public params: IDataWithCacheParams,
    ) { }

    async getData() {
        return this.params.getData();
    }
}
