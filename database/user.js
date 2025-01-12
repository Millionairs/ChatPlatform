import { query } from './index.js'
import bcrypt from 'bcrypt';

// Helper functions for user operations
export const createUser = async (username, password, role) => {
    try {
        console.log(role);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const result = await query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username',
            [username, passwordHash, role]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') { // PostgreSQL unique violation error code
            throw new Error('postgres error');
        }
        throw new Error('Failed to create user');
    }
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

