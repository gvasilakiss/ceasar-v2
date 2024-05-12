const express = require('express');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const Joi = require('joi');
const crypto = require('crypto');
const validator = require('validator');
const xss = require('xss');
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

const sanitizeInput = (input) => {
    return xss(validator.escape(input));
};

app.post('/register', async (req, res) => {
    const { error } = userValidationSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username: sanitizeInput(username) });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await argon2.hash(password);

        console.log('Hashed password:', hashedPassword)
        console.log('Sanitized username:', sanitizeInput(username));

        const newUser = new User({ username: sanitizeInput(username), password: hashedPassword, permissions: ['user'] });
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
        const user = await User.findOne({ username: sanitizeInput(username) });
        if (!user || !(await argon2.verify(user.password, password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = generateToken(user, process.env.JWT_SECRET); // Generate JWT token
        res.json({ token, expiresAt: new Date(jwt.decode(token).exp * 1000).toISOString() });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/validate', async (req, res) => {
    const { token } = req.body;

    // Check if token is provided
    if (!token) {
        return res.status(400).json({ valid: false, message: 'Token is required' });
    }

    try {
        // Decode and verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // console.log("Decoded token:", decoded);

        // Check if user exists
        const user = await User.findById(decoded.user.id);
        if (!user) {
            return res.status(401).json({ valid: false, message: 'User not found' });
        }

        // Reconstruct expected signature to verify it
        const expectedSignature = crypto
            .createHmac('sha3-512', process.env.JWT_SECRET)
            .update(JSON.stringify({ ...decoded, signature: undefined }))
            .digest('hex');

        // Validate signature
        if (decoded.signature !== expectedSignature) {
            return res.status(401).json({ valid: false, message: 'Token signature is invalid' });
        }

        // Check if the token has expired
        const currentTime = Date.now();
        const tokenExpiresAt = decoded.exp * 1000; // Convert expiration time from seconds to milliseconds
        if (currentTime >= tokenExpiresAt) {
            return res.status(401).json({
                valid: false,
                message: 'Token has expired',
                expiresAt: new Date(tokenExpiresAt).toISOString()
            });
        }

        // Return successful validation
        res.json({
            valid: true,
            message: 'Token is valid',
            user: decoded.user,
            expiresAt: new Date(tokenExpiresAt).toISOString()
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                valid: false,
                message: 'Token has expired',
                expiresAt: new Date(error.expiredAt).toISOString()
            });
        }
        console.error('Token validation failed:', error);
        res.status(401).json({ valid: false, message: 'Invalid token' });
    }
});

function generateToken(user, secretKey) {
    const issuedAt = Math.floor(Date.now() / 1000); // Current time in seconds since epoch
    const expiresIn = 10 * 60; // Token expires in 10 minutes

    const payload = {
        user: {
            id: user._id,
            username: user.username,
            permissions: user.permissions,
        },
        system: 'Authentication System',
        iat: issuedAt,
        exp: issuedAt + expiresIn
    };

    const signature = crypto.createHmac('sha3-512', secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');

    return jwt.sign({ ...payload, signature }, secretKey);
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
