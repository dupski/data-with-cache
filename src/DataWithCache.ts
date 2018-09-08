import { ICacheBackend, ICachedValue } from './types';
import { withTimeout } from './utils';

export type Strategy = 'api_first' | 'cache_first';
export type ErrorLevel = 'error' | 'warning';

export interface IDataWithCacheParams {
    strategy: Strategy;
    cache: ICacheBackend;
    objectType: string;
    objectId: string;
    apiTimeout?: number;
    cacheTimeout?: number;
    cacheExpires?: number;
    debug?: boolean;
    getData: () => Promise<any>;
    onRefreshing?: () => void;
    onRefreshed?: () => any;
    onError?: (error: Error, level: ErrorLevel) => void;
}

const requiredParams: Array<keyof IDataWithCacheParams> = [
    'strategy', 'cache', 'objectType', 'objectId', 'getData',
];

const DEFAULT_API_TIMEOUT = 5000;

export class DataWithCache<T> {
    private loading = false;

    constructor(
        public params: IDataWithCacheParams,
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
            default:
                throw new Error(`Unknown strategy "${this.params.strategy}".`);
        }
    }

    private async apiFirst(): Promise<T> {
        const p = this.params;
        let apiResult: T | null = null;
        try {
            apiResult = await this.callGetData();
        }
        catch (e) {
            this.logError(e, 'warning');
        }
        if (apiResult) {
            this.setCache(apiResult);
            return apiResult;
        }
        else {
            let cacheResult: ICachedValue<T> | null;
            try {
                cacheResult = await p.cache.get<T>(p.objectType, p.objectId);
            }
            catch (e) {
                this.logError(e, 'error');
                throw e;
            }
            if (cacheResult) {
                return cacheResult.value;
            }
            else {
                throw new Error(
                    `getData() failed and no cache match for object "${p.objectType}", id: "${p.objectId}"`);
            }
        }
    }

    private async callGetData() {
        return withTimeout(
            this.params.apiTimeout || DEFAULT_API_TIMEOUT,
            this.params.getData(),
        );
    }

    private async setCache(data: T) {
        try {
            const p = this.params;
            const cacheValue: ICachedValue<T> = {
                value: data,
                timestamp: Date.now(),
            };
            p.cache.set(p.objectType, p.objectId, cacheValue);
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
}
