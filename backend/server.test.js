const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/test-login-validation', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ msg: "Field wajib diisi" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ msg: "Format email tidak valid" });

    res.status(200).json({ msg: "Validasi Lolos" });
});

describe('Unit Test: Validasi Form Login', () => {
    it('Harus gagal jika email/password kosong', async () => {
        const res = await request(app)
            .post('/test-login-validation')
            .send({ email: '', password: '' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toEqual("Field wajib diisi");
    });

    it('Harus gagal jika format email salah', async () => {
        const res = await request(app)
            .post('/test-login-validation')
            .send({ email: 'bukan-email', password: '123' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toEqual("Format email tidak valid");
    });

    it('Harus sukses jika data valid', async () => {
        const res = await request(app)
            .post('/test-login-validation')
            .send({ email: 'test@javis.com', password: '123' });
        expect(res.statusCode).toEqual(200);
    });
});