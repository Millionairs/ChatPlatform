import { openEventForm } from './formModal.js';

export async function dateClickHandler(info) {
    openEventForm();
    const dateAndTimeArray = info.dateStr.split('T');
    if (dateAndTimeArray.length === 1) {
        document.getElementById('eventDate').value = dateAndTimeArray[0];
    } else if (dateAndTimeArray.length === 2){
        document.getElementById('eventDate').value = dateAndTimeArray[0];
        document.getElementById('startTime').value = dateAndTimeArray[1].split('+')[0];

    } else {
        console.error('Error: Invalid date string');
    }
}
