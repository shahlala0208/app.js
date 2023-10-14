const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  user: 'your_db_user',
  host: 'your_db_host',
  database: 'myappdb',
  password: 'your_db_password',
  port: 5432
});

// Middleware untuk verifikasi token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    req.userId = decoded.id;
    next();
  });
}

// Register User
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password], (err, result) => {
    if (err) {
      res.status(500).send('Error registering user.');
    } else {
      const token = jwt.sign({ id: result.insertId }, 'your_secret_key', {
        expiresIn: 86400 // Expires in 24 hours
      });
      res.status(200).send({ auth: true, token });
    }
  });
});

// Login User
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  pool.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
    if (err) return res.status(500).send('Error on the server.');
    if (!result.rows[0]) return res.status(404).send('No user found.');

    const user = result.rows[0];

    if (user.password !== password) return res.status(401).send({ auth: false, token: null });

    const token = jwt.sign({ id: user.id }, 'your_secret_key', {
      expiresIn: 86400 // Expires in 24 hours
    });

    res.status(200).send({ auth: true, token });
  });
});

// GET Users (with Pagination)
app.get('/users', verifyToken, (req, res) => {
  const page = req.query.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  pool.query('SELECT id, username FROM users ORDER BY id LIMIT $1 OFFSET $2', [limit, offset], (err, result) => {
    if (err) return res.status(500).send('Error on the server.');
    res.status(200).send(result.rows);
  });
});

// Implementasi DELETE dan PUT endpoints

// ...

// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
