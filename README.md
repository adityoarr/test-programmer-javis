# Web Programmer Challenge - PT. Javis Teknologi Albarokah

Aplikasi autentikasi web sederhana yang dibangun menggunakan arsitektur **Microservices-ready** dengan Docker. Proyek ini mencakup fitur Login, Validasi, Rate Limiting, Dark Mode, dan Unit Testing.

## 🛠 Tech Stack

Sesuai spesifikasi teknis yang disarankan:

- **Frontend:** React.js (Vite) + TailwindCSS
- **Backend:** Node.js (Express)
- **Database:** MySQL 8.0
- **Cache & Rate Limiter:** Redis
- **Containerization:** Docker & Docker Compose
- **Testing:** Jest & Supertest

## 🚀 Fitur Utama

1. **Sistem Login Aman:** Menggunakan `bcrypt` untuk hashing dan `JWT` dengan `HttpOnly Cookie`.
2. **Validasi Input:** Validasi sisi server dan klien (termasuk format email Regex).
3. **Rate Limiting:** Mencegah brute-force (Maksimal 5 percobaan gagal/menit per IP) menggunakan Redis.
4. **Dark Mode:** Tampilan responsif dengan toggle tema Gelap/Terang.
5. **Dashboard Terproteksi:** Halaman dashboard hanya bisa diakses jika token valid.
6. **Unit Testing:** Pengujian otomatis untuk validasi backend.

## 📂 Struktur Arsitektur

Aplikasi ini dirancang menggunakan arsitektur **Client-Server** yang dijalankan dalam lingkungan **Docker Container** terisolasi:

1.  **Frontend Service (React.js + TailwindCSS)**
    - Berjalan di port `5173` sebagai antarmuka pengguna.
    - Mengonsumsi REST API dari Backend menggunakan Axios.
    - Menangani validasi input sisi klien dan tampilan responsif (Mobile/Desktop).

2.  **Backend Service (Node.js + Express)**
    - Berjalan di port `5000` sebagai pusat logika aplikasi.
    - Menangani otentikasi aman menggunakan **JWT** & **HttpOnly Cookie**.
    - Melakukan validasi data ketat (termasuk Regex Email) sebelum diproses.

3.  **Database Service (MySQL)**
    - Menyimpan data pengguna secara persisten menggunakan Docker Volume.
    - Hanya dapat diakses oleh Backend (terisolasi dari publik).

4.  **Rate Limiter Service (Redis)**
    - Menyimpan jejak percobaan login sementara di memori (In-Memory).
    - Membatasi serangan _Brute Force_ (Maksimal 5x gagal per menit per IP).

## 🏃‍♂️ Cara Menjalankan Project (Local)

### Prasyarat

Pastikan **Docker** dan **Docker Compose** sudah terinstal di komputer Anda.

### Langkah-langkah

1. Clone repository ini.
2. Buka terminal di root folder proyek.
3. Jalankan perintah berikut untuk membangun dan menyalakan semua layanan:

   ```bash
   docker-compose up --build
   ```

4. Tunggu hingga proses selesai.
   Frontend dapat diakses di: http://localhost:5173
   Backend berjalan di: http://localhost:5000

## Akun Demo

Karena database dimulai kosong, silakan gunakan Postman atau curl untuk registrasi user pertama: POST `http://localhost:5000/register`

```bash
{
  "email": "adityoarr@example.com",
  "password": "123"
}
```

Lalu login melalui Frontend.
