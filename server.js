import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { query } from './database/index.js';
import { createUser, verifyUser } from './database/user.js';
import jwt from 'jsonwebtoken';
import { authenticateHttp, authenticateWs } from './auth/authMiddleware.js';
import e from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import fs from 'fs';
import eventsRouter from './routes/event.js';

dotenv.config();


const app = express();
const server = http.createServer(app);
const io = new Server(server);
const upload = multer({ dest: 'uploads/' }); // Temporary file storage

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

app.use(express.static('public'));
app.use(express.json());

// Mounting events router
app.use('/api/events', eventsRouter);

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

//Handle file uploads
app.post('/upload', upload.single('file'), async (req, res) => {
    const { sender, receiver } = req.body;
    const fileContent = await fs.promises.readFile(req.file.path);
    const s3Params = {
        Bucket: 'chatplatform', // Replace with your bucket name
        Key: `uploads/${Date.now()}-${req.file.originalname}`,
        Body: fileContent,
        ContentType: req.file.mimetype
    };

    try {
        // Upload file to S3
        const command = new PutObjectCommand(s3Params);
        await s3Client.send(command);

        const fileUrl = `https://${s3Params.Bucket}.s3.ap-southeast-1.amazonaws.com/${s3Params.Key}`;

        // Save metadata in the database
        await query(
            'INSERT INTO messages (sender, receiver, content, file_url, timestamp) VALUES ($1, $2, $3, $4, $5)',
            [sender, receiver, null, fileUrl, new Date()]
        );

        // Emit file message in real-time
        io.emit('receiveMessage', {
            sender,
            fileUrl
        });

        res.json({ message: 'File uploaded successfully', fileUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'File upload failed' });
    } finally {
        // Delete the temporary file
        await fs.promises.unlink(req.file.path);
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

server.listen(process.env.PORT, process.env.HOST, () => {
    console.log('Server is running on http://0.0.0.0:3000');
});
