import { DataWithCache } from '../DataWithCache';
import { ICacheBackend, ICachedValue } from '../types';

const objectType = 'company';
const objectId = '12';
const data = { test: 1 };

const now = 10000;
Date.now = jest.fn().mockReturnValue(now);
const cacheExpires = 1000;

const currentValue: ICachedValue<typeof data> = {
    timestamp: now - cacheExpires + 100,
    value: data,
};
const expiredValue: ICachedValue<typeof data> = {
    timestamp: now - cacheExpires - 100,
    value: data,
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
                getData,
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

        it('returns the expected data', () => {
            expect(result).toEqual(data);
        });

    });

});
