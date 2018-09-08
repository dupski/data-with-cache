
export function getUIHandles() {
    return {
        strategy: document.getElementById('strategy') as HTMLSelectElement,
        apiTimeout: document.getElementById('apiTimeout') as HTMLInputElement,
        cacheExpires: document.getElementById('cacheExpires') as HTMLInputElement,
        apiResponseTime: document.getElementById('apiResponseTime') as HTMLInputElement,
        apiError: document.getElementById('apiError') as HTMLInputElement,
        goButton: document.getElementById('goButton') as HTMLButtonElement,
    };
}
