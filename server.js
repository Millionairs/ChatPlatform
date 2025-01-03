import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { query, createUser, verifyUser } from './db.js';
import jwt from 'jsonwebtoken';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// Socket.IO Logic
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', async ({ sender, receiver, message }) => {
        const timestamp = new Date();
        await query(
            'INSERT INTO messages (sender, receiver, content, timestamp) VALUES ($1, $2, $3, $4)',
            [sender, receiver, message, timestamp]
        );

        io.emit('receiveMessage', { sender, receiver, message, timestamp });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Middleware to verify JWT for HTTP requests
const authenticateHttp = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Messages endpoint
app.get('/messages', authenticateHttp, async (req, res) => {
    try {
        const { sender, receiver } = req.query;
        const result = await query(
            'SELECT * FROM messages WHERE (sender = $1 AND receiver = $2) OR (sender = $2 AND receiver = $1) ORDER BY timestamp ASC',
            [sender, receiver]
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

// WebSocket authentication
const authenticateWs = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication required'));
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.userId;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
};

io.use(authenticateWs);

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:3000');
});
