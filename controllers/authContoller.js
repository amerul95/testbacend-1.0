const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const dbConfigAuth = require('../config/dbConfigauth');

// Create connection pool for authentication database
const authDBPool = new sql.ConnectionPool(dbConfigAuth);

// Connect to the authentication database
authDBPool.connect(err => {
    if (err) {
        console.error('Failed to connect to authentication database:', err);
    } else {
        console.log('Connected to authentication database');
    }
});

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const request = new sql.Request(authDBPool);
        request.input('Email', sql.NVarChar, email);

        const checkQuery = `SELECT * FROM Users WHERE email = @Email`;
        const result = await request.query(checkQuery);

        if (result.recordset.length > 0) {
            return res.status(400).json({ errors: [{ msg: 'Email already in use' }] });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO Users (name, email, password) VALUES (@Name, @Email, @Password)`;
        request.input('Name', sql.NVarChar, name);
        request.input('Password', sql.NVarChar, hashedPassword);

        await request.query(query);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error registering user: ', err);
        res.status(500).send('Server error');
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const request = new sql.Request(authDBPool);
        request.input('Email', sql.NVarChar, email);

        const query = `SELECT * FROM Users WHERE email = @Email`;
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(401).json({ errors: [{ msg: 'Invalid email or password' }] });
        }

        const user = result.recordset[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ errors: [{ msg: 'Invalid email or password' }] });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, 'secretkey', { expiresIn: '1h' }); // Replace 'secretkey' with your actual secret

        res.json({ token });
    } catch (err) {
        console.error('Error logging in: ', err);
        res.status(500).send('Server error');
    }
};