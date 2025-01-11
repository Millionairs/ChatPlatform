const socket = io({
    auth: {
        token: localStorage.getItem('token')
    }
});

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');

const sender = localStorage.getItem('username');

const receiverId = localStorage.getItem('chatReceiverId');
const receiver = localStorage.getItem('receiverName');
// Display the chat receiver's name
//document.getElementById('chat-receiver').textContent = `Chat with ${receiverUsername}`;


// Load previous messages with authentication
fetch(`/messages?receiver=${receiver}`, {
    method: 'POST', 
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: localStorage.getItem('username') })
})
.then((response) => response.json())
.then((messages) => {
    messages.forEach(({ sender, content, file_url }) => {
        const messageElement = document.createElement('p');
        messageElement.classList.add('message');

        if (content) {
            if (sender === localStorage.getItem('username')) {
                messageElement.textContent = `[${sender}] ${content}`;
                messageElement.classList.add('userMessage');
            } else {
                messageElement.textContent = `[${sender}] ${content}`;
                messageElement.classList.add('receiverMessage');
            }
        } else if (file_url) {
            const fileLink = document.createElement('a');
            fileLink.href = file_url;
            fileLink.textContent = 'View File';
            fileLink.target = '_blank';
            messageElement.textContent = `[${sender}] `;
            messageElement.appendChild(fileLink);

            if (sender === localStorage.getItem('username')) {
                messageElement.classList.add('userMessage');
            } else {
                messageElement.classList.add('receiverMessage');
            }
        }

        chatBox.appendChild(messageElement);
    });
});

// Handle sending messages
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim(); // Trim whitespace from the input
    if (message === '') {
        // Do not send an empty or whitespace-only message
        alert('Cannot send an empty message.');
        return;
    }
    
    socket.emit('sendMessage', { sender, message, receiver});
    messageInput.value = '';
});

// Display received messages
socket.on('receiveMessage', ({ sender: msgSender, message, fileUrl }) => {
    const messageElement = document.createElement('p');
    if (message) {
        messageElement.textContent = `[${msgSender}] ${message}`;
    } else if (fileUrl) {
        const fileLink = document.createElement('a');
        fileLink.href = fileUrl;
        fileLink.textContent = 'View File';
        fileLink.target = '_blank';
        messageElement.textContent = `[${sender}] `;
        messageElement.appendChild(fileLink);
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
});



//Handle file uploads
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sender', sender);
    formData.append('receiver', 'broadcast');

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.fileUrl) {
            console.log('File uploaded successfully:', result.fileUrl);
        }
    } catch (error) {
        console.error('File upload error:', error);
    }
});
