
export interface ICacheBackend {
    get<T>(objectType: string, objectId: string, options?: any): Promise<T | null>;
    set(objectType: string, objectId: string, data: any, options?: any): Promise<void>;
}
