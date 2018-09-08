import { fetchAttendeesList } from './api';

fetchAttendeesList(100)
    .then((attendees) => {
        console.log('attendees', attendees);
    })
    .catch((e) => {
        console.error(e);
    });
