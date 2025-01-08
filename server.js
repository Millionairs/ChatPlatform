import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { query, createUser, verifyUser } from './db.js';
import jwt from 'jsonwebtoken';
import { authenticateHttp, authenticateWs } from './auth/authMiddleware.js';
import e from 'express';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// Socket.IO Logic
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', async ({ sender, message }) => {
        const timestamp = new Date();
        await query(
            'INSERT INTO messages (sender, receiver, content, timestamp) VALUES ($1, $2, $3, $4)',
            [sender, 'broadcast', message, timestamp]
        );

        io.emit('receiveMessage', { sender, message, timestamp });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Messages endpoint
app.get('/messages', authenticateHttp, async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM messages WHERE receiver = $1 ORDER BY timestamp ASC',
            ['broadcast']
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// User registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await createUser(username, password);
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await verifyUser(username, password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, username: user.username });
});

// Apply WebSocket authentication middleware
io.use(authenticateWs);

// Fetch all users except the logged-in user
app.post('/api/users', authenticateHttp, async (req, res) => {

    const username = await req.body.username; 
    const userId = req.userId;
    console.log(username);
    try {
        console.log('Fetching users');
        console.log(username)
        const result = await query(
            'SELECT * FROM users WHERE id != $1',
            [userId]
        );
        await res.json(result.rows);
        console.log('Users fetched');
        console.log("server user result "+ result.rows);
    } catch (error) {
        console.log(error.message);
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users', errorMessage: error.message });
    }
});



const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:3000');
});
