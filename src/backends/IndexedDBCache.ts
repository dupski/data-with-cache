import { ICacheBackend } from '../types';

export class IndexdDBCache implements ICacheBackend {
    db: IDBDatabase = null as any;

    constructor(
        private dbName: string,
        private storeName: string = 'dataWithCacheStore'
    ) {
        const idb = indexedDB.open(dbName, 1);
        idb.onupgradeneeded = () => {
            idb.result.createObjectStore(storeName);
        };
        idb.onsuccess = () => {
            this.db = idb.result;
        };
    }

    async get<T>(objectType: string, objectId: string): Promise<T | null> {
        return new Promise<T | null>((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.get(this.getKey(objectType, objectId));

            req.onsuccess = () => {
                resolve(req.result || null);
            };
            req.onerror = (err) => {
                reject(req.error);
            };
        });
    }

    async set(objectType: string, objectId: string, data: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.put(data, this.getKey(objectType, objectId));

            req.onsuccess = () => {
                resolve();
            };
            req.onerror = (err) => {
                reject(req.error);
            };
        });
    }

    private getKey(objectType: string, objectId: string) {
        return objectType + '__' + objectId;
    }

}
