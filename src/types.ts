
export interface ICacheBackend {
    get<T>(objectType: string, objectId: string): Promise<T>;
    set(objectType: string, objectId: string, data: any): Promise<void>;
}
