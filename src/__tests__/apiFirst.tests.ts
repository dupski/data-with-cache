import { DataWithCache } from '../DataWithCache';
import { ICacheBackend, ICachedValue } from '../types';
import { sleep } from '../utils';

const objectType = 'company';
const objectId = '12';
const now = 245325342;
Date.now = jest.fn().mockReturnValue(now);

const data = { test: 1 };
const cachedValue: ICachedValue<typeof data> = {
    timestamp: now,
    value: data,
};

export class MockCacheBackend implements ICacheBackend {
    get = jest.fn();
    set = jest.fn();
}

describe('DataWithCache - apiFirst() tests', () => {
    let cache: MockCacheBackend;
    let getData: jest.Mock<any>;
    let dataWithCache: DataWithCache<any>;
    let result: any;
    let onError: jest.Mock<any>;

    describe('when getData() is successful', () => {

        beforeAll(async () => {
            jest.clearAllMocks();
            cache = new MockCacheBackend();
            getData = jest.fn().mockResolvedValue(data);

            dataWithCache = new DataWithCache({
                strategy: 'api_first',
                cache, objectType, objectId,
                getData,
            });
            result = await dataWithCache.getData();
        });

        it('calls getData()', () => {
            expect(getData).toHaveBeenCalledTimes(1);
        });

        it('does not check the cache', () => {
            expect(cache.get).not.toHaveBeenCalled();
        });

        it('caches the result with the current timestamp', () => {
            expect(cache.set).toHaveBeenCalledTimes(1);
            const args = cache.set.mock.calls[0];
            expect(args[0]).toEqual(objectType);
            expect(args[1]).toEqual(objectId);
            expect(args[2]).toEqual({
                value: data,
                timestamp: now,
            });
        });

        it('returns the expected data', () => {
            expect(result).toEqual(data);
        });

    });

    describe('when getData() throws an error, but the cache read succeeds', () => {
        const expectedError = new Error('timed out after 1ms');

        beforeAll(async () => {
            jest.clearAllMocks();
            getData = jest.fn().mockImplementation(async () => {
                // trigger a timeout error
                await sleep(100);
            });
            cache = new MockCacheBackend();
            cache.get.mockResolvedValue(cachedValue);
            onError = jest.fn();

            dataWithCache = new DataWithCache({
                strategy: 'api_first',
                cache, objectType, objectId,
                apiTimeout: 1,
                getData, onError,
            });
            result = await dataWithCache.getData();
        });

        it('calls getData()', () => {
            expect(getData).toHaveBeenCalledTimes(1);
        });

        it('logs the timeout error', () => {
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expectedError, 'warning');
        });

        it('checks the cache for a match', () => {
            expect(cache.get).toHaveBeenCalledTimes(1);
            expect(cache.get).toHaveBeenCalledWith(
                objectType, objectId,
            );
        });

        it('returns the expected data', () => {
            expect(result).toEqual(data);
        });

    });

    describe('when getData() fails, and there is no cached value', () => {
        const apiError = new Error('API returned a 500 :(');
        let returnedError: Error;

        beforeAll(async () => {
            jest.clearAllMocks();
            getData = jest.fn().mockRejectedValue(apiError);
            cache = new MockCacheBackend();
            cache.get.mockResolvedValue(null);
            onError = jest.fn();

            dataWithCache = new DataWithCache({
                strategy: 'api_first',
                cache, objectType, objectId,
                apiTimeout: 1,
                getData, onError,
            });

            try {
                await dataWithCache.getData();
            }
            catch (e) {
                returnedError = e;
            }
        });

        it('calls getData()', () => {
            expect(getData).toHaveBeenCalledTimes(1);
        });

        it('logs the apiError', () => {
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(apiError, 'warning');
        });

        it('checks the cache for a match', () => {
            expect(cache.get).toHaveBeenCalledTimes(1);
            expect(cache.get).toHaveBeenCalledWith(
                objectType, objectId,
            );
        });

        it('throws the expected error', () => {
            expect(returnedError).toEqual(new Error(
                `getData() failed and no cache match for object "${objectType}", id: "${objectId}"`
            ));
        });

    });

    describe('when getData() succeeds but cache.set() fails', () => {
        const expectedError = new Error('could not set cache');

        beforeAll(async () => {
            jest.clearAllMocks();
            cache = new MockCacheBackend();
            cache.set.mockRejectedValue(expectedError);
            getData = jest.fn().mockResolvedValue(data);
            onError = jest.fn();

            dataWithCache = new DataWithCache({
                strategy: 'api_first',
                cache, objectType, objectId,
                getData, onError
            });
            result = await dataWithCache.getData();
            await sleep(50);
        });

        it('calls getData()', () => {
            expect(getData).toHaveBeenCalledTimes(1);
        });

        it('tries to cache the result', () => {
            expect(cache.set).toHaveBeenCalledTimes(1);
        });

        it('logs the error', () => {
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(
                expectedError, 'warning'
            );
        });

        it('still returns the expected data', () => {
            expect(result).toEqual(data);
        });

    });

    describe('when getData() fails, and the cache also fails', () => {
        const apiError = new Error('API returned a 500 :(');
        const cacheError = new Error('IndexedDB is not available :(');
        let returnedError: Error;

        beforeAll(async () => {
            jest.clearAllMocks();
            getData = jest.fn().mockRejectedValue(apiError);
            cache = new MockCacheBackend();
            cache.get.mockRejectedValue(cacheError);
            onError = jest.fn();

            dataWithCache = new DataWithCache({
                strategy: 'api_first',
                cache, objectType, objectId,
                apiTimeout: 1,
                getData, onError,
            });

            try {
                await dataWithCache.getData();
            }
            catch (e) {
                returnedError = e;
            }
        });

        it('calls getData()', () => {
            expect(getData).toHaveBeenCalledTimes(1);
        });

        it('logs the api error', () => {
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenCalledWith(apiError, 'warning');
        });

        it('checks the cache for a match', () => {
            expect(cache.get).toHaveBeenCalledTimes(1);
            expect(cache.get).toHaveBeenCalledWith(
                objectType, objectId,
            );
        });

        it('logs the cache error', () => {
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenCalledWith(cacheError, 'error');
        });

        it('throws the cache error', () => {
            expect(returnedError).toEqual(cacheError);
        });

    });

});
