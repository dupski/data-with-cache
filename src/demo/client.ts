
import { DataWithCache, InMemoryCache, Strategy } from '../index';
import * as api from './api';
import { getUIHandles } from './ui';

const ui = getUIHandles();

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

ui.clearButton.onclick = () => {
    ui.showLoader(false);
    ui.showResult(null);
    ui.setStatus('Not Loaded');
};

ui.goButton.onclick = async () => {

    console.log('Requesting data using strategy:', ui.strategy.value);

    // Configure API
    api.params.apiResponseTime = Number(ui.apiResponseTime.value);
    api.params.throwError = ui.apiError.checked;

    // Configure UI
    ui.showLoader(true);
    ui.showResult(null);
    ui.setStatus('Loading...');

    // Request data via DataWithCache
    const data = getSeminarAttendees(123);
    try {
        const result = await data.getData();

        // Success! Update UI
        ui.showLoader(false);
        ui.showResult(result);
        ui.setStatus('Finished Loading.');
    }
    catch (e) {
        // Failure. Log error to console
        console.error(e);
        ui.showLoader(false);
        ui.setStatus('Error Returned. See console.');
    }

};
