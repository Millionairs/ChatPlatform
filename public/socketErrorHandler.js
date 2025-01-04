const socket = io({
    auth: {
        token: localStorage.getItem('token')
    }
});

socket.on('connect_error', (error) => {
    if (error.message === 'Authentication required' || error.message === 'Invalid token') {
        localStorage.removeItem('token');  // Clear invalid token
        window.location.href = '/login.html';
    }
});

// Update your message sending code to handle errors
socket.on('error', (error) => {
    console.error('Socket error:', error);
    if (error.message === 'Authentication required' || error.message === 'Invalid token') {
        window.location.href = '/login.html';
    }
}); 