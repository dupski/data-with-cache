import { ICacheBackend } from './types';

export interface IDataWithCacheParams {
    cache: ICacheBackend;
    objectType: string;
    objectId: string;
    getData: () => Promise<any>;
    apiTimeout?: number;
    cacheTimeout?: number;
    cacheExpires?: number;
}

export class APIFirstStrategy {
    constructor(
        public params: IDataWithCacheParams,
    ) {
        console.log('constructed!');
    }

    getData() {
        return;
    }
}
