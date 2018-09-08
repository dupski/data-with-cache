
export interface ICacheBackend {
    get<T>(objectType: string, objectId: string, options?: any): Promise<ICachedValue<T> | null>;
    set(objectType: string, objectId: string, data: ICachedValue<any>, options?: any): Promise<void>;
}

export interface ICachedValue<T> {
    value: T;
    timestamp: number;
}
