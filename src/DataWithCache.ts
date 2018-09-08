import { ICacheBackend, ICachedValue } from './types';
import { sleep, withTimeout } from './utils';

export type Strategy = 'api_first' | 'cache_first';
export type ErrorLevel = 'error' | 'warning';

export interface IDataWithCacheParams<T> {
    strategy: Strategy;
    cache: ICacheBackend;
    objectType: string;
    objectId: string;
    apiTimeout?: number;
    cacheTimeout?: number;
    cacheExpires?: number;
    debug?: boolean;
    getData: () => Promise<T>;
    onError?: (error: Error, level: ErrorLevel) => void;
}

const requiredParams: Array<keyof IDataWithCacheParams<any>> = [
    'strategy', 'cache', 'objectType', 'objectId', 'getData',
];

const DEFAULT_API_TIMEOUT = 5000;
const DEFAULT_CACHE_TIMEOUT = 1000;

export class DataWithCache<T> {

    onRefreshing?: () => void;
    onRefreshed?: (data: T) => any;

    private loading = false;

    constructor(
        public params: IDataWithCacheParams<T>,
    ) {
        requiredParams.forEach((param) => {
            if (!this.params[param]) {
                throw new Error(`Required parameter "${param}" is missing.`);
            }
        });
    }

    async getData(): Promise<T> {
        const p = this.params;
        if (this.loading) {
            throw new Error('getData() has already been called on this object.');
        }
        this.loading = true;
        switch (this.params.strategy) {
            case 'api_first':
                return this.apiFirst();
            case 'cache_first':
                return this.cacheFirst();
            default:
                throw new Error(`Unknown strategy "${this.params.strategy}".`);
        }
    }

    private async apiFirst(): Promise<T> {
        const p = this.params;
        let apiResult: T | null = null;
        this.debug('api_first: making getData() request.');
        try {
            apiResult = await this.callGetData();
        }
        catch (e) {
            this.logError(e, 'warning');
        }
        if (apiResult) {
            this.debug('api_first: getData() succeeded. Adding data to cache and returning it.');
            this.setCache(apiResult);
            return apiResult;
        }
        else {
            let cacheResult: ICachedValue<T> | null = null;
            try {
                cacheResult = await this.getFromCache();
            }
            catch (e) {
                this.logError(e, 'error');
            }
            if (cacheResult) {
                this.debug('api_first: getData() failed. Value exists in cache. Returning it.');
                return cacheResult.value;
            }
            else {
                throw new Error(
                    `getData() failed and no cache match for object "${p.objectType}", id: "${p.objectId}"`);
            }
        }
    }

    private async cacheFirst(): Promise<T> {
        const p = this.params;
        let cacheResult: ICachedValue<T> | null = null;
        this.debug('cache_first: trying to get value from cache.');
        try {
            cacheResult = await this.getFromCache();
        }
        catch (e) {
            this.logError(e, 'warning');
        }
        if (cacheResult) {
            const now = Date.now();
            if (typeof p.cacheExpires != 'undefined'
                && (now - cacheResult.timestamp) > p.cacheExpires) {

                // Refresh cache in a seperate event
                sleep(10)
                    .then(() => {
                        this.debug('cache_first: cached value has expired. Calling getData()..');
                        if (this.onRefreshing) {
                            this.onRefreshing();
                        }
                        return this.callGetData();
                    })
                    .then((res) => {
                        if (res) {
                            this.debug('cache_first: getDate() returned a result. Updating cached value.');
                            this.setCache(res);
                            if (this.onRefreshed) {
                                this.onRefreshed(res);
                            }
                        }
                    })
                    .catch((e) => {
                        this.logError(e, 'warning');
                    });
            }
            this.debug('cache_first: matched cached value. Returning it.');
            return cacheResult.value;
        }
        else {
            let apiResult: T | null = null;
            this.debug('cache_first: did not match a cached value. Calling getData()...');
            try {
                apiResult = await this.callGetData();
            }
            catch (e) {
                this.logError(e, 'error');
            }
            if (apiResult) {
                this.debug('cache_first: getData() succeeded. Adding data to cache and returning it.');
                this.setCache(apiResult);
                return apiResult;
            }
            else {
                throw new Error(
                    `No cache match and getData() failed for object "${p.objectType}", id: "${p.objectId}"`);
            }
        }
    }

    private async callGetData() {
        return withTimeout(
            this.params.apiTimeout || DEFAULT_API_TIMEOUT,
            this.params.getData(),
        );
    }

    private async getFromCache() {
        const p = this.params;
        return withTimeout(
            p.cacheTimeout || DEFAULT_CACHE_TIMEOUT,
            p.cache.get<T>(p.objectType, p.objectId)
        );
    }

    private async setCache(data: T) {
        try {
            const p = this.params;
            const cacheValue: ICachedValue<T> = {
                value: data,
                timestamp: Date.now(),
            };
            await withTimeout(
                p.cacheTimeout || DEFAULT_CACHE_TIMEOUT,
                p.cache.set(p.objectType, p.objectId, cacheValue)
            );
        }
        catch (e) {
            this.logError(e, 'warning');
        }
    }

    private logError(error: Error, level: ErrorLevel) {
        if (this.params.onError) {
            this.params.onError(error, level);
        }
        if (this.params.debug) {
            level == 'error'
                ? console.error(error)
                : console.warn(error);
        }
    }

    private debug(message: string) {
        if (this.params.debug) {
            console.log('DataWithCache: ' + message
                + ' (object "' + this.params.objectType
                + '", id: "' + this.params.objectId + '")');
        }
    }
}
