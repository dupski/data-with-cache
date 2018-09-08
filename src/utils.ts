
export function withTimeout<T>(timeout: number, promise: Promise<T>, error?: Error): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((resolve, reject) => {
            setTimeout(() => {
                reject(error || new Error(`timed out after ${timeout}ms`));
            }, timeout);
        }),
    ]);
}

export function sleep(timeout: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
