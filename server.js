import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { query } from './db.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Socket.IO Logic
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle sending a message
    socket.on('sendMessage', async ({ sender, receiver, message }) => {
        // Save to database
        const timestamp = new Date();
        await query(
            'INSERT INTO messages (sender, receiver, content, timestamp) VALUES ($1, $2, $3, $4)',
            [sender, receiver, message, timestamp]
        );

        // Emit the message to the receiver
        io.emit('receiveMessage', { sender, receiver, message, timestamp });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Endpoint to fetch previous messages
app.get('/messages', async (req, res) => {
    const { sender, receiver } = req.query;
    const result = await query(
        'SELECT * FROM messages WHERE (sender = $1 AND receiver = $2) OR (sender = $2 AND receiver = $1) ORDER BY timestamp ASC',
        [sender, receiver]
    );
    res.json(result.rows);
});

// Start the server
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:3000')}
);
