import { addEvent } from './eventActions.js';

export async function displayModal() {
    const modal = document.getElementById('event-modal');
    modal.style.display = 'block';
}

export async function closeModal() {
    const modal = document.getElementById('event-modal');
    modal.style.display = 'none';
}

  // Open the event creation form
export async function openEventForm() {
    document.getElementById('eventForm').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

// Close the event creation form
export async function closeEventForm() {
    document.getElementById('eventForm').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';

    // Reset the form to default state
    document.querySelector('#eventForm h2').innerText = 'Create Event';
    const addEventButton = document.getElementById('addEventConfirm');
    addEventButton.textContent = "Add Event";

    // Remove all listeners from the button
    const newAddEventButton = addEventButton.cloneNode(true);
    addEventButton.parentNode.replaceChild(newAddEventButton, addEventButton);

    // Add listener for adding event
    newAddEventButton.addEventListener('click', addEvent); // Revert back to Add Event functionality
}

export async function clearForm() {
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('allDay').checked = false;
    document.querySelector('input[name="eventColor"]:checked').checked = false;
}

export async function getEventDataFromForm() {
    const title = document.getElementById('eventTitle').value;
    const description = document.getElementById('eventDescription').value;
    const date = document.getElementById('eventDate').value;
    let startTime = document.getElementById('startTime').value;
    let endTime = document.getElementById('endTime').value;
    const allDay = document.getElementById('allDay').checked;
    const color = document.querySelector('input[name="eventColor"]:checked')?.value;

    // Validation
    if (title === '') {
        alert('Please enter a title for your event!');
        return null;
    }

    if (date === '') {
        alert('Please select a date for your event!');
        return null;
    }

    if (startTime === '' && endTime === '' && !allDay) {
        alert('Please either specify it is an all day event, or enter a time for your event!');
        return null;
    }

    if ((startTime !== '' || endTime !== '') && allDay) {
        alert('All day events cannot have specific times!');
        return null;
    }

    if (((startTime === '' && endTime !== '') || (startTime !== '' && endTime === '')) && !allDay) {
        alert('Please enter both a start and end time!');
        return null;
    }

    if (!color) {
        alert('Please select a color for your event!');
        return null;
    }

    // Time adjustments
    if (startTime === '' && endTime === '' && allDay) {
        startTime = date + 'T' + '00:00';
        endTime = null;
    }

    if (startTime !== '' && endTime !== '' && !allDay) {
        startTime = date + 'T' + startTime; // Concatenate date and time for specific time event
        endTime = date + 'T' + endTime;

        if (new Date(startTime) >= new Date(endTime)) {
            alert('End time must be after start time');
            return null;
        }
    }

    // Return the event data
    return {
        title: title,
        description: description,
        start: startTime,
        end: endTime,
        allDay: allDay,
        color: color
    };
}
