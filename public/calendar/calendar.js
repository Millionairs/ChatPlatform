import { getEventsByUserId } from './eventActions.js';
import { eventClickHandler, eventUpdateHandler } from './eventHandler.js';
import { dateClickHandler } from './dateHandler.js';

let calendar;

document.addEventListener('DOMContentLoaded', async function() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: await getEventsByUserId(),
        editable: true,
        droppable: true,
        selectable: true,
        dateClick: dateClickHandler,
        eventClick: eventClickHandler,
        eventDrop: eventUpdateHandler,
        eventResize: eventUpdateHandler
    });
    calendar.render();
});


export function getCalendarInstance() {

    if (calendar) {
        return calendar;
    } else {
        throw new Error('Calendar has not been initialized yet');
    }
}

