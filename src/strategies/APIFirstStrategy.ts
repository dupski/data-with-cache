import { ICacheBackend } from "../types";

export interface IAPIFirstParams {
    cache: ICacheBackend;
    objectType: string;
    objectId: string;
    getData: () => Promise<any>;
    apiTimeout?: number;
    cacheTimeout?: number;
}

export class APIFirstStrategy {
    constructor(
        public params: IAPIFirstParams,
    ) { }

    getData() {
        return;
    }
}
