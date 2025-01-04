const socket = io({
    auth: {
        token: localStorage.getItem('token')
    }
});

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');

const sender = localStorage.getItem('username');

// Load previous messages with authentication
fetch(`/messages`, {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
})
.then((response) => response.json())
.then((messages) => {
    messages.forEach(({ sender, content, timestamp }) => {
        const messageElement = document.createElement('p');
        messageElement.textContent = `[${sender}] ${content}`;
        chatBox.appendChild(messageElement);
    });
});

// Handle sending messages
sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    socket.emit('sendMessage', { sender, message });
    messageInput.value = '';
});

// Display received messages
socket.on('receiveMessage', ({ sender: msgSender, message }) => {
    const messageElement = document.createElement('p');
    messageElement.textContent = `[${msgSender}] ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
});
