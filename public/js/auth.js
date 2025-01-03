export function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

export function logout() {
    localStorage.removeItem('token');
    
    if (typeof socket !== 'undefined') {
        socket.disconnect();
    }
    
    window.location.href = '/login.html';
} 