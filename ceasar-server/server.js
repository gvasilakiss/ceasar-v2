const express = require('express');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const Joi = require('joi');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:8081',
    credentials: true,
}));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB Atlas..."))
    .catch(err => console.error("Could not connect to MongoDB Atlas...", err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    permissions: [String],
});
const User = mongoose.model('User', userSchema);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

const userValidationSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required()
});

app.post('/register', async (req, res) => {
    const { error } = userValidationSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await argon2.hash(password);
        const newUser = new User({ username, password: hashedPassword, permissions: ['read'] });
        await newUser.save();

        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', loginLimiter, async (req, res) => {
    const { error } = userValidationSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await argon2.verify(user.password, password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = generateToken(user, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/validate', (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, user: decoded.user });
    } catch (error) {
        res.status(401).json({ valid: false, error: 'Invalid token' });
    }
});

function generateToken(user, secretKey) {
    const payload = {
        user: {
            id: user._id,
            username: user.username,
            permissions: user.permissions,
        },
        system: 'Authentication System',
        issuedAt: Date.now(),
    };

    const signature = crypto.createHmac('sha3-512', secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');

    return jwt.sign({ ...payload, signature }, secretKey, { expiresIn: '1m' });
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
