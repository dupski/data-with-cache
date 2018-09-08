
import { DataWithCache, InMemoryCache, Strategy } from '../index';
import { API } from './api';
import { getUIHandles } from './ui';

const ui = getUIHandles();

const cache = new InMemoryCache();

function getSeminarAttendees(seminarId: number) {
    return new DataWithCache({
        strategy: ui.strategy.value as Strategy,
        cache,
        objectType: 'seminarAttendees',
        objectId: String(seminarId),
        getData: () => API.getSeminarAttendees(seminarId),
    });
}

ui.goButton.onclick = async () => {
    console.log('Requesting data using strategy:', ui.strategy.value);

    const data = getSeminarAttendees(123);

    const result = await data.getData();

    console.log('result', result);
};
