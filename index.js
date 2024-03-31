const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const app = express();
const port = 3000;
const bodyParser = require('body-parser')

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'nc3',
    password: '',
    port: 5432,
});
client.connect();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/submitLoginForm', async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    console.log(username);
    console.log(password);

    try {
        const result = await client.query('SELECT * FROM users WHERE username = $1 and password = $2', [username, password]);
        console.log(result);
        if (result.rows.length > 0) {
            res.sendFile(__dirname + '/dashboard.html');
        } else {
            res.send('Invalid username and password');
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }

});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(__dirname + '/dashboard.html');
});

app.get('/getUsers', async (req, res) => {
    try {
        const result = await client.query('Select id, username, password, permission from users');
        res.send(result.rows)
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/deleteUser/:id', async (req, res) => {
    try {
        await client.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

app.post('/addUsers', async (req, res) => {
    const { username, password, permission } = req.body;

    try {
        const result = await client.query('INSERT INTO users (username, password, permission) VALUES ($1, $2, $3) RETURNING *', [username, password, permission]);
        if (result.rows.length > 0) {
            res.send(result.rows[0]);
            // res.sendFile(__dirname + '/dashboard.html');
        } else {
            res.send('No Record was created!')
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }

});

app.put('/submitEditUserForm', async (req, res) => {
    res.send('It\'s edit time!');
});

app.listen(port, () => {
    console.log('listening on port ', + port);
});