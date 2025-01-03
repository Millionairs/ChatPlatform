import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false, // Optional for RDS
    },
});


db.connect();

// Helper functions for user operations
export const createUser = async (username, password) => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const result = await db.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
        [username, passwordHash]
    );
    return result.rows[0];
};

export const verifyUser = async (username, password) => {
    const result = await db.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    return validPassword ? user : null;
};

export const query = (text, params) => db.query(text, params);
