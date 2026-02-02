require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { createClient } = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:6379`
});
redisClient.connect().catch(console.error);

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail',
    points: 5,
    duration: 60,
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Email & Password wajib" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    try {
        await db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hash]);
        res.json({ msg: "User berhasil dibuat" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        await rateLimiter.consume(req.ip);
    } catch (rejRes) {
        return res.status(429).json({ msg: "Terlalu banyak percobaan login. Tunggu 1 menit." });
    }

    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ msg: "Field wajib diisi" });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ msg: "Format email tidak valid" });

    try {
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(400).json({ msg: "Email tidak ditemukan" });

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(400).json({ msg: "Password salah" });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: false
        });

        res.json({ msg: "Login berhasil" });

    } catch (error) {
        res.status(500).json({ msg: "Server Error" });
    }
});

app.get('/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ msg: "Tidak terautentikasi" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ msg: "Token invalid" });
        res.json({ email: decoded.email, msg: "Akses Dashboard Diizinkan" });
    });
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ msg: "Logout berhasil" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));