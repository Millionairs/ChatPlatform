import { query } from "./index.js"

export const createEventUserLink = async (object) => {
    const { eventId, userId } = object;
    const queryText = `
        INSERT INTO event_user_links (event_id, user_id)
        VALUES ($1, $2)
        RETURNING id
    `;
    const result = await query(queryText, [eventId, userId]);
    return result.rows[0];
};
