import { getCalendarInstance } from "./calendar.js";
import { closeEventForm, clearForm, getEventDataFromForm } from "./formModal.js";


// Function to fetch events from the database
export async function getEventsByUserId() {
    const token = localStorage.getItem('token'); 
    const response = await fetch('/api/events', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .catch(error => console.error('Error:', error));

    return response;
}

// Function to add an event to the calendar
export async function addEvent() {

    const eventData = await getEventDataFromForm();
    if (!eventData) return; // Validation failed


    // Add event to the database
    const token = localStorage.getItem('token'); 
    const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        if (response.ok) {
            console.log('Event saved to the database successfully');
        } else {
            console.error('Failed to save the event to the database');
        }
        return response.json();
    });

    const calendar = getCalendarInstance();

    // Add the event to the calendar
    calendar.addEvent(response);


    // Close the form and clear the inputs
    closeEventForm();
    clearForm();
}


export async function updateEvent(event) {

    const eventData = await getEventDataFromForm();
    if (!eventData) {
        return;
    }


    try {
        // Update the event in the database
        const response = await fetch(`/api/events/${event.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            // Update the event in the calendar
            event.setProp('title', eventData.title);
            event.setExtendedProp('description', eventData.description);
            event.setAllDay(eventData.allDay);
            event.setStart(eventData.start);
            event.setEnd(eventData.end);
            event.setProp('color', eventData.color);

        }
    } catch (error) {
        console.error('Error updating event:', error);
        alert('An error occurred while updating the event.');
    } finally {
            // Update the event in the calendar

        closeEventForm();
        clearForm();
    }
}

export async function deleteEvent(event) {
    try {
        await fetch(`/api/events/${event.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('An error occurred while deleting the event.');
    } finally {
        event.remove();
        document.getElementById('event-modal').style.display = 'none';
    }
}

export async function updateEventByPatch(event) {
    const updatedData = {
        start: event.start.toLocaleString(),
        end: event.end ? event.end.toLocaleString() : null
    };
    
    try {
        const response = await fetch(`/api/events/${event.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(updatedData),
        });
    
        if (response.ok) {
            event.setStart(updatedData.start);
            event.setEnd(updatedData.end);
        }
    } catch (error) {
        console.error('Error during the PATCH request:', error);
        alert('An error occurred while updating the event.');
    }
}

