import { query } from './index.js'
import bcrypt from 'bcrypt';

// Helper functions for user operations
export const createUser = async (username, password) => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const result = await query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
        [username, passwordHash]
    );
    return result.rows[0];
};

export const verifyUser = async (username, password) => {
    const result = await query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    return validPassword ? user : null;
};

