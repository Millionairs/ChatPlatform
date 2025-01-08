
import { openEventForm, closeModal, displayModal } from './formModal.js';
import { updateEvent, deleteEvent, addEvent, updateEventByPatch } from './eventActions.js';

export function eventClickHandler(info) {
    const event = info.event;

    document.getElementById('modal-title').textContent = event.title;
    document.getElementById('modal-start').textContent = event.start.toLocaleString();
    document.getElementById('modal-end').textContent = event.end ? event.end.toLocaleString() : 'N/A';
    document.getElementById('modal-description').textContent = event.extendedProps.description || 'No description available.';

    // display the modal
    displayModal();

    // closing the modal
    const closeBtn = document.getElementById('event-modal').querySelector('.close');
    closeBtn.onclick = function () {
        closeModal();
    };

    window.onclick = function (event) {
        if (event.target == document.getElementById('event-modal')) {
            closeModal();
        }
    };

    const editBtn = document.getElementById('edit-event-btn');
    editBtn.onclick = function () {

        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDescription').value = event.extendedProps.description || "";
        document.getElementById('eventDate').value = event.start.toLocaleDateString('en-CA');

        if (event.allDay) {
            document.getElementById('startTime').value = "";
            document.getElementById('endTime').value = "";
        } else {
            document.getElementById('startTime').value = event.start.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false // Use 24-hour format
            });
            document.getElementById('endTime').value = event.end ? event.end.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false // Use 24-hour format
            }) : "";
        }

        document.getElementById('allDay').checked = event.allDay;

        document.querySelector(`input[name="eventColor"][value="${event.backgroundColor}"]`).checked = true;

        // Close the modal
        closeModal();

        // Open Event Form for Editing
        openEventForm();


        // Replace the "Create Event" title with "Update Event"
        document.querySelector('#eventForm h2').innerText = 'Update Event';
        // Replace the "Add Event" functionality with "Update Event" functionality     
        const addEventButton = document.getElementById('addEventConfirm');
        addEventButton.textContent = "Update Event";

        addEventButton.removeEventListener('click', addEvent); // Remove Add Event functionality
        addEventButton.addEventListener('click', async () => {
            await updateEvent(event);
        }); // Add a Update Event functionality

    };

    const deleteBtn = document.getElementById('delete-event-btn');
    deleteBtn.onclick = async function () {
        if (confirm("Are you sure you want to delete this event?")) {
            await deleteEvent(event);
        }
    };
}



export async function eventUpdateHandler(info) {
    const event = info.event;
    await updateEventByPatch(event);
}