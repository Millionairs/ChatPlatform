import { query } from '../db.js';

export const handleConnection = (io, socket) => {
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
}; 