let editingId = null;
const loggedInUserId = localStorage.getItem('userId');

fetch('/destinations')
    .then(response => response.json())
    .then(data => {
        const destinationsDiv = document.getElementById('destinations');

        data.forEach(destination => {

            const p = document.createElement('p');

            p.textContent = `${destination.title} - ${destination.location}, ${destination.country} `;

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';

            editButton.addEventListener('click', () => {
                editingId = destination.id;

                document.getElementById('title').value = destination.title;

                document.getElementById('date_from').value = destination.date_from
                    ? destination.date_from.split('T')[0]
                    : '';

                document.getElementById('date_to').value = destination.date_to
                    ? destination.date_to.split('T')[0]
                    : '';

                document.getElementById('description').value = destination.description;
                document.getElementById('location').value = destination.location;
                document.getElementById('country').value = destination.country;
            });

           p.appendChild(editButton);

if (loggedInUserId) {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', async () => {
        const confirmed = confirm(
            'Are you sure you want to delete this destination?'
        );

        if (!confirmed) {
            return;
        }

        await fetch(`/destinations/${destination.id}`, {
            method: 'DELETE'
        });

        p.remove();
    });

    p.appendChild(deleteButton);
}

destinationsDiv.appendChild(p);
        });
    });

const form = document.getElementById('destinationForm');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newDestination = {
        title: document.getElementById('title').value,
        date_from: document.getElementById('date_from').value || null,
        date_to: document.getElementById('date_to').value || null,
        description: document.getElementById('description').value,
        location: document.getElementById('location').value,
        country: document.getElementById('country').value
    };

    let url = '/destinations';
    let method = 'POST';

    if (editingId !== null) {
        url = `/destinations/${editingId}`;
        method = 'PUT';
    }

    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDestination)
    });

    const data = await response.json();

    console.log(data);

    window.location.reload();
});

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    const data = await response.json();

  if (response.ok) {
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('username', data.username);

    document.getElementById('loginMessage').textContent =
        `Logged in as ${data.username}`;
}
else {
        document.getElementById('loginMessage').textContent =
            data.error;
    }
});

const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    const response = await fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    const data = await response.json();

    if (response.ok) {
        document.getElementById('signupMessage').textContent =
            'User created successfully';
    } else {
        document.getElementById('signupMessage').textContent =
            data.error;
    }
});

logoutButton.addEventListener('click', async () => {

    await fetch('/logout', {
        method: 'POST'
    });

    localStorage.removeItem('userId');
    localStorage.removeItem('username');

    window.location.reload();
});