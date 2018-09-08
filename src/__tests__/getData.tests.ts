import { InMemoryCache } from '../Backends';
import { DataWithCache } from '../DataWithCache';
import { sleep } from '../utils';

const cache = new InMemoryCache();
const objectType = 'company';
const objectId = '12';

async function getData() {
    await sleep(100);
    return 'test';
}

describe('DataWithCache - getData() tests', () => {

    it('throws an error if called twice', async () => {
        const data = new DataWithCache({
            strategy: 'api_first',
            cache, objectType, objectId,
            getData,
        });
        data.getData();
        await expect(data.getData())
            .rejects
            .toEqual(new Error('getData() has already been called on this object.'));
    });

    it('throws an error if called with an invalid strategy', async () => {
        const data = new DataWithCache({
            strategy: 'use_google' as any,
            cache, objectType, objectId,
            getData,
        });
        await expect(data.getData())
            .rejects
            .toEqual(new Error('Unknown strategy "use_google".'));
    });

});
