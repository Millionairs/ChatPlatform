const socket = io();

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');

const sender = prompt('Enter your name');
const receiver = prompt('Enter the name of the person you want to chat with');

// Load previous messages
fetch(`/messages?sender=${sender}&receiver=${receiver}`)
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
    socket.emit('sendMessage', { sender, receiver, message });
    messageInput.value = '';
});

// Display received messages
socket.on('receiveMessage', ({ sender: msgSender, receiver: msgReceiver, message }) => {
    if (msgSender === sender || msgReceiver === sender) {
        const messageElement = document.createElement('p');
        messageElement.textContent = `[${msgSender}] ${message}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
