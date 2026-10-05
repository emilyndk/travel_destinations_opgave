const bcrypt = require('bcrypt');
const express = require('express');
const { Pool } = require('pg');
const session = require('express-session');


const app = express();
const port = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Citronmaane!23',
    port: 5432,
});

app.use(express.json());
app.use(session({
    secret: 'travel-secret',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static('public'));


app.get('/destinations', async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM travel_destinations.destinations'
    );

    res.json(result.rows);
});

app.post('/destinations', async (req, res) => {
    const { title, date_from, date_to, description, location, country } = req.body;


    if (!title) {
    return res.status(400).json({
        error: 'Title is required'
    });
}

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({
            message: 'Logged out'
        });
    });
});

    const result = await pool.query(
        `INSERT INTO travel_destinations.destinations
        (title, date_from, date_to, description, location, country)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [title, date_from, date_to, description, location, country]
    );

    res.status(201).json(result.rows[0]);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.put('/destinations/:id', async (req, res) => {
    const { id } = req.params;
    const { title, date_from, date_to, description, location, country } = req.body;

    const result = await pool.query(
        `UPDATE travel_destinations.destinations
        SET title = $1,
            date_from = $2,
            date_to = $3,
            description = $4,
            location = $5,
            country = $6
        WHERE id = $7
        RETURNING *`,
        [title, date_from, date_to, description, location, country, id]
    );

    res.json(result.rows[0]);
});

app.delete('/destinations/:id', async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            error: 'You must be logged in'
        });
    }

    const { id } = req.params;

    const result = await pool.query(
        `DELETE FROM travel_destinations.destinations
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    res.json(result.rows[0]);
});

app.get('/destinations/:id', async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
        `SELECT * FROM travel_destinations.destinations
         WHERE id = $1`,
        [id]
    );

    res.json(result.rows[0]);
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: 'Username and password are required'
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO travel_destinations.users
        (username, password)
        VALUES ($1, $2)
        RETURNING id, username`,
        [username, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const result = await pool.query(
        `SELECT * FROM travel_destinations.users
         WHERE username = $1`,
        [username]
    );

    const user = result.rows[0];

    if (!user) {
        return res.status(401).json({
            error: 'Wrong username or password'
        });
    }

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
        return res.status(401).json({
            error: 'Wrong username or password'
        });
    }

   req.session.userId = user.id;
   
   res.json({
        message: 'Login successful',
        userId: user.id,
        username: user.username
    });
});