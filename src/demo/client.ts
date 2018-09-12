
import { DataWithCache, /*IndexedDBCache,*/ InMemoryCache, Strategy } from '../index';
import { sleep } from '../utils';
import * as api from './api';
import { getUIHandles } from './ui';

const ui = getUIHandles();

// const cache = new IndexedDBCache('app_cache');
const cache = new InMemoryCache();

function getSeminarAttendees(seminarId: number) {
    return new DataWithCache<api.IAttendee[]>({
        strategy: ui.strategy.value as Strategy,
        cache,
        objectType: 'seminarAttendees',
        objectId: String(seminarId),
        cacheExpires: Number(ui.cacheExpires.value),
        apiTimeout: Number(ui.apiTimeout.value),
        getData: () => api.getSeminarAttendees(seminarId),
        debug: true
    });
}

ui.goButton.onclick = async () => {

    console.log('Requesting data using strategy:', ui.strategy.value);

    // Configure API
    api.params.apiResponseTime = Number(ui.apiResponseTime.value);
    api.params.throwError = ui.apiError.checked;

    // Configure UI
    ui.showLoader(true);
    ui.showResult(null);
    ui.setStatus('Loading...');
    // Artificial delay so the user can see something has happened in cache_first mode
    await sleep(100);

    // Request data via DataWithCache
    const data = getSeminarAttendees(123);

    // Set up listeners for data refreshes
    data.onRefreshing = () => {
        ui.setStatus('Loaded. Refreshing...');
    };
    data.onRefreshed = (result) => {
        ui.setStatus('Loaded.');
        ui.showResult(result);
    };

    try {
        const result = await data.getData();

        // Success! Update UI
        ui.showLoader(false);
        ui.showResult(result);
        ui.setStatus('Loaded.');
    }
    catch (e) {
        // Failure. Log error to console
        console.error(e);
        ui.showLoader(false);
        ui.setStatus('Error Returned. See console.');
    }

};
