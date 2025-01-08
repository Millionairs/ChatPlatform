import { query } from './index.js';


export const getEvents = async (event) => {
    const result = await query(`
        SELECT e.id, e.title, e.description, e.start_time, e.end_time, e.all_day, e.color
        FROM events AS e
        JOIN event_user_links AS eul ON e.id = eul.event_id
        WHERE eul.user_id = $1;`,
        [event.userId]  // Fetch events associated with the logged-in user
    );
    return result;
}

export const createEvent = async (event) => {
    const { title, description, start, end, allDay, color } = event;
    const queryText = `
        INSERT INTO events (title, description, start_time, end_time, all_day, color)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, title, description, start_time, end_time, all_day, color;
    `;
    const result = await query(queryText, [title, description, start, end, allDay, color]);
    return result.rows[0];
};

// Update event in database
export const updateEvent = async (event) => {
    const { id, title, description, start, end, allDay, color, userId } = event;

    const updateQuery = `
        UPDATE events
        SET title = $1, description = $2, start_time = $3, end_time = $4, all_day = $5, color = $6,
        updated_at = NOW()
        WHERE id = $7
        RETURNING id, title, description, start_time, end_time, all_day, color;
    `;

    const values = [title, description, start, end, allDay, color, id];

    const result = await query(updateQuery, values);
    return result.rows[0];
};

export const updateTime = async (event) => {
    const { id, start, end } = event;

    const updateQuery = `
        UPDATE events
        SET start_time = $1, end_time = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, start_time, end_time;
    `;

    const values = [start, end, id];

    const result = await query(updateQuery, values);
    return result.rows[0];
};

// Delete event from database
export const deleteEvent = async (event) => {
    const { id } = event;
    const deleteQuery = 'DELETE FROM events WHERE id = $1 RETURNING id';

    const result = await query(deleteQuery, [id]);
    return result.rows[0];
};


// Get all events for a user

// Get a single event by ID
