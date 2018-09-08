import { DataWithCache } from '../DataWithCache';
import { ICacheBackend, ICachedValue } from '../types';

const objectType = 'company';
const objectId = '12';
const currentData = { test: 2 };
const expiredData = { test: 1 };

const now = 10000;
Date.now = jest.fn().mockReturnValue(now);
const cacheExpires = 1000;

const currentValue: ICachedValue<typeof currentData> = {
    timestamp: now - cacheExpires + 100,
    value: currentData,
};
const expiredValue: ICachedValue<typeof expiredData> = {
    timestamp: now - cacheExpires - 100,
    value: expiredData,
};

export class MockCacheBackend implements ICacheBackend {
    get = jest.fn();
    set = jest.fn();
}

describe('DataWithCache - cacheFirst() tests', () => {
    let cache: MockCacheBackend;
    let getData: jest.Mock<any>;
    let dataWithCache: DataWithCache<any>;
    let result: any;
    let onError: jest.Mock<any>;

    describe('when cache contains a current match', () => {

        beforeAll(async () => {
            jest.clearAllMocks();
            cache = new MockCacheBackend();
            cache.get.mockResolvedValue(currentValue);
            getData = jest.fn();

            dataWithCache = new DataWithCache({
                strategy: 'cache_first',
                cache, objectType, objectId,
                getData, cacheExpires
            });
            result = await dataWithCache.getData();
        });

        it('calls cache.get()', () => {
            expect(cache.get).toHaveBeenCalledTimes(1);
            expect(cache.get).toHaveBeenCalledWith(
                objectType, objectId
            );
        });

        it('does not call the api', () => {
            expect(getData).not.toHaveBeenCalled();
        });

        it('does not update the cache (because data is current)', () => {
            expect(cache.set).not.toHaveBeenCalled();
        });

        it('returns the current data', () => {
            expect(result).toEqual(currentData);
        });

    });

    describe('when cache contains an expired match', () => {

        beforeAll(async () => {
            jest.clearAllMocks();
            cache = new MockCacheBackend();
            cache.get.mockResolvedValue(expiredValue);
            getData = jest.fn().mockResolvedValue(currentData);

            dataWithCache = new DataWithCache({
                strategy: 'cache_first',
                cache, objectType, objectId,
                getData, cacheExpires
            });
            result = await dataWithCache.getData();
        });

        it('calls cache.get()', () => {
            expect(cache.get).toHaveBeenCalledTimes(1);
            expect(cache.get).toHaveBeenCalledWith(
                objectType, objectId
            );
        });

        it('returns the expired data (for speed)', () => {
            expect(result).toEqual(expiredData);
        });

        it('calls getData() for the most recent data', () => {
            expect(getData).toHaveBeenCalledTimes(1);
        });

        it('calls cache.set() with the current data', () => {
            expect(cache.set).toHaveBeenCalledTimes(1);
            const args = cache.set.mock.calls[0];
            expect(args[0]).toEqual(objectType);
            expect(args[1]).toEqual(objectId);
            expect(args[2]).toEqual({
                value: currentData,
                timestamp: now,
            });
        });

    });

    describe('when cache does not contain a match, but getData() is successful', () => {

        beforeAll(async () => {
            jest.clearAllMocks();
            cache = new MockCacheBackend();
            cache.get.mockResolvedValue(null);
            getData = jest.fn().mockResolvedValue(currentData);

            dataWithCache = new DataWithCache({
                strategy: 'cache_first',
                cache, objectType, objectId,
                getData, cacheExpires
            });
            result = await dataWithCache.getData();
        });

        it('calls cache.get()', () => {
            expect(cache.get).toHaveBeenCalledTimes(1);
            expect(cache.get).toHaveBeenCalledWith(
                objectType, objectId
            );
        });

        it('calls getData()', () => {
            expect(getData).toHaveBeenCalledTimes(1);
        });

        it('calls cache.set() with the current data', () => {
            expect(cache.set).toHaveBeenCalledTimes(1);
            const args = cache.set.mock.calls[0];
            expect(args[0]).toEqual(objectType);
            expect(args[1]).toEqual(objectId);
            expect(args[2]).toEqual({
                value: currentData,
                timestamp: now,
            });
        });

        it('returns the current data', () => {
            expect(result).toEqual(currentData);
        });

    });

    describe('when cache does not contain a match, and getData() does not return a result', () => {
        let returnedError: Error;

        beforeAll(async () => {
            jest.clearAllMocks();
            cache = new MockCacheBackend();
            cache.get.mockResolvedValue(null);
            getData = jest.fn().mockResolvedValue(null);

            dataWithCache = new DataWithCache({
                strategy: 'cache_first',
                cache, objectType, objectId,
                getData, cacheExpires
            });
            try {
                await dataWithCache.getData();
            }
            catch (e) {
                returnedError = e;
            }
        });

        it('calls cache.get()', () => {
            expect(cache.get).toHaveBeenCalledTimes(1);
            expect(cache.get).toHaveBeenCalledWith(
                objectType, objectId
            );
        });

        it('calls getData()', () => {
            expect(getData).toHaveBeenCalledTimes(1);
        });

        it('does not call cache.set()', () => {
            expect(cache.set).not.toHaveBeenCalled();
        });

        it('throws the expected error', () => {
            expect(returnedError).toEqual(new Error(
                `No cache match and getData() failed for object "${objectType}", id: "${objectId}"`
            ));
        });

    });

    describe('when cache.get() throws, but getData() is successful', () => {
        const expectedError = new Error('E-ROAR');

        beforeAll(async () => {
            jest.clearAllMocks();
            cache = new MockCacheBackend();
            cache.get.mockRejectedValue(expectedError);
            getData = jest.fn().mockResolvedValue(currentData);
            onError = jest.fn();

            dataWithCache = new DataWithCache({
                strategy: 'cache_first',
                cache, objectType, objectId,
                getData, cacheExpires, onError
            });
            result = await dataWithCache.getData();
        });

        it('calls cache.get()', () => {
            expect(cache.get).toHaveBeenCalledTimes(1);
            expect(cache.get).toHaveBeenCalledWith(
                objectType, objectId
            );
        });

        it('logs the error', () => {
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(
                expectedError, 'warning'
            );
        });

        it('calls getData()', () => {
            expect(getData).toHaveBeenCalledTimes(1);
        });

        it('calls cache.set() with the current data', () => {
            expect(cache.set).toHaveBeenCalledTimes(1);
            const args = cache.set.mock.calls[0];
            expect(args[0]).toEqual(objectType);
            expect(args[1]).toEqual(objectId);
            expect(args[2]).toEqual({
                value: currentData,
                timestamp: now,
            });
        });

        it('returns the current data', () => {
            expect(result).toEqual(currentData);
        });

    });

    describe('when cache.get() throws, and getData() throws', () => {
        const expectedCacheError = new Error('E-ROAR');
        const expectedApiError = new Error('Boomtown');
        let returnedError: Error;

        beforeAll(async () => {
            jest.clearAllMocks();
            cache = new MockCacheBackend();
            cache.get.mockRejectedValue(expectedCacheError);
            getData = jest.fn().mockRejectedValue(expectedApiError);
            onError = jest.fn();

            dataWithCache = new DataWithCache({
                strategy: 'cache_first',
                cache, objectType, objectId,
                getData, cacheExpires, onError
            });
            try {
                result = await dataWithCache.getData();
            }
            catch (e) {
                returnedError = e;
            }
        });

        it('calls cache.get()', () => {
            expect(cache.get).toHaveBeenCalledTimes(1);
            expect(cache.get).toHaveBeenCalledWith(
                objectType, objectId
            );
        });

        it('logs the error', () => {
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenCalledWith(
                expectedCacheError, 'warning'
            );
        });

        it('calls getData()', () => {
            expect(getData).toHaveBeenCalledTimes(1);
        });

        it('logs the error', () => {
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenCalledWith(
                expectedApiError, 'error'
            );
        });

        it('does not call cache.set()', () => {
            expect(cache.set).not.toHaveBeenCalled();
        });

        it('throws the expected error', () => {
            expect(returnedError).toEqual(new Error(
                `No cache match and getData() failed for object "${objectType}", id: "${objectId}"`
            ));
        });

    });

});
