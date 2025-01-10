const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

async function fetchUsers() {
    
    //display name
    console.log(localStorage.getItem('username'));
    const displayName = document.createElement('p');
    displayName.textContent = 'Hello ' + localStorage.getItem('username');

    document.body.insertBefore(displayName, document.getElementById('user-list'));

    // Fetch users
    const response = await fetch('/api/users', {
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ username: localStorage.getItem('username') })
    });

    if (response.ok) {
        const users = await response.json();
        console.log(users);
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';

       


        users.forEach(user => {
            console.log(user.username);
            const userButton = document.createElement('button');
            userButton.textContent = user.username;
            userButton.onclick = () => {
                localStorage.setItem('receiverId', user.id);
                localStorage.setItem('receiverName', user.username);
                console.log(user.username);
                window.location.href = '/index.html';
            };
            userList.appendChild(userButton);
        });
    } else {
        alert('Failed to fetch users');
    }
}

function logout() {
localStorage.removeItem('token');

if (typeof socket !== 'undefined') {
    socket.disconnect();
}

window.location.href = '/login.html';
}

fetchUsers();