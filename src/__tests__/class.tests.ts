import { DataWithCache } from '../DataWithCache';

describe('DataWithCache - class tests', () => {

    it('throws an error if params are missing', () => {
        expect(() => {
            // tslint:disable-next-line:no-unused-expression
            new DataWithCache({} as any);
        }).toThrow('Required parameter "strategy" is missing.');
    });

});
