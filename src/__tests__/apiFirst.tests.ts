import { DataWithCache } from '../DataWithCache';
import { ICacheBackend } from '../types';

const objectType = 'company';
const objectId = '12';
const now = 245325342;

Date.now = jest.fn().mockReturnValue(now);

export class MockCacheBackend implements ICacheBackend {
    get = jest.fn();
    set = jest.fn();
}

describe('DataWithCache - apiFirst() tests', () => {
    let cache: MockCacheBackend;
    let getData: jest.Mock<any>;
    let dataWithCache: DataWithCache<any>;
    let result: any;

    describe('when getData() is successful', () => {
        const data = { test: 1 };

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

        it('calls the getApiDataFn()', () => {
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

        it('returns the result', () => {
            expect(result).toEqual(data);
        });

    });

});
