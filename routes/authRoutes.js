import express from 'express';
import { createUser, verifyUser } from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await createUser(username, password);
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await verifyUser(username, password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token, username: user.username });
});

export default router; 