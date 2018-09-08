import { ICacheBackend } from '../types';

export class InMemoryCache implements ICacheBackend {

    __cache: {
        [objectType: string]: {
            [objectId: string]: any;
        };
    } = {};

    async get<T>(objectType: string, objectId: string): Promise<T | null> {
        if (objectType in this.__cache
            && objectId in this.__cache[objectType]) {
            return this.__cache[objectType][objectId];
        }
        return null;
    }

    async set(objectType: string, objectId: string, data: any): Promise<void> {
        if (!(objectType in this.__cache)) {
            this.__cache[objectType] = {};
        }
        this.__cache[objectType][objectId] = data;
    }

}
