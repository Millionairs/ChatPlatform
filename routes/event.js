import express from 'express';
import { authenticateHttp } from '../auth/authMiddleware.js';
import { getEvents, createEvent, updateEvent, deleteEvent, updateTime } from '../database/event.js';
import { createEventUserLink } from '../database/eventUserLinks.js';

const router = express.Router();

router.get('/', authenticateHttp, async (req, res) => {
    try {
        // Use req.user.id to filter events for the authenticated user
        const { userId } = req;
        const result = await getEvents({ userId });

        // Transform the data to rename keys or modify values
        const events = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            start: row.start_time,  
            end: row.end_time,      
            allDay: row.all_day, 
            color: row.color
        }));

        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

router.post('/', authenticateHttp, async (req, res) => {
    const { title, description, start, end, allDay, color } = req.body;
    const { userId } = req;
    const newEvent = await createEvent({ title, description, start, end, allDay, color });

    if (!newEvent) {
        return res.status(500).json({ error: 'Failed to save event' });
    }

    const newEventUserLink = await createEventUserLink({ eventId: newEvent.id, userId });

    if (!newEventUserLink) {
        return res.status(500).json({ error: 'Failed to save event and user links' });
    }

    // Transform the data to rename keys or modify values
    const event = {
        id: newEvent.id, 
        title: newEvent.title, 
        description: newEvent.description, 
        start: newEvent.start_time, 
        end: newEvent.end_time, 
        allDay: newEvent.all_day, 
        color: newEvent.color 
    };

    res.status(201).json(event);
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const event = await deleteEvent({ id });

        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        
        res.status(201).json(event);

    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Failed to delete event' });
    }
});

router.put('/:id', authenticateHttp, async (req, res) => {
    const { title, description, start, end, allDay, color } = req.body;
    const { id } = req.params;
    const event = await updateEvent({ id, title, description, start, end, allDay, color });

    if (!event) {
        return res.status(404).json({ error: 'Event not found.' });
    }
    
    res.status(201).json(event);
});

router.patch('/:id', authenticateHttp, async (req, res) => {
    const { start, end } = req.body;
    const { id } = req.params;
    const event = await updateTime({ id, start, end });

    if (!event) {
        return res.status(404).json({ error: 'Event not found.' });
    }
    
    res.status(201).json(event);
});

export default router;
