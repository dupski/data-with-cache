
import { DataWithCache, InMemoryCache, Strategy } from '../index';
import * as api from './api';
import { getUIHandles } from './ui';

const ui = getUIHandles();

const cache = new InMemoryCache();

function getSeminarAttendees(seminarId: number) {
    return new DataWithCache({
        strategy: ui.strategy.value as Strategy,
        cache,
        objectType: 'seminarAttendees',
        objectId: String(seminarId),
        getData: () => api.getSeminarAttendees(seminarId),
    });
}

ui.goButton.onclick = async () => {
    console.log('Requesting data using strategy:', ui.strategy.value);
    api.params.apiResponseTime = Number(ui.apiResponseTime.value);
    ui.showLoader(true);
    ui.showResult(null);
    ui.setStatus('Loading...');

    const data = getSeminarAttendees(123);

    try {
        const result = await data.getData();
        ui.showLoader(false);
        ui.showResult(result);
        ui.setStatus('Finished Loading.');
    } catch (e) {
        console.error(e);
        ui.showLoader(false);
        ui.setStatus('Error Returned. See console.');
    }

};
