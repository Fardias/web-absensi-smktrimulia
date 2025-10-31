# Web Absensi SMK Trimulia

Aplikasi web untuk sistem absensi digital SMK Trimulia yang dibangun dengan React 19 dan Vite.

## 🚀 Fitur Utama

### ✅ **Fitur yang Sudah Diimplementasi:**

1. **Sistem Autentikasi**

   - Login dengan JWT token
   - Role-based access control (Admin, Guru Piket, Wali Kelas, Siswa)
   - Protected routes berdasarkan role

2. **Dashboard Siswa**

   - Tampilan waktu real-time
   - Status lokasi GPS
   - Tombol absensi datang dan pulang
   - Modal absensi dengan loading dan status

3. **Sistem Absensi**

   - Absensi datang dengan validasi radius
   - Absensi pulang dengan validasi waktu (minimal jam 15:00)
   - Validasi lokasi GPS (radius 50 meter)
   - Pesan error yang spesifik dari backend

4. **Komponen Reusable**

   - `Header` - Header dengan navigasi dan user info
   - `Loading` - Komponen loading dengan animasi
   - `TimeCard` - Kartu waktu real-time
   - `LocationCard` - Kartu status lokasi GPS
   - `AbsensiModal` - Modal untuk konfirmasi absensi

5. **Custom Hooks**

   - `useAbsensi` - Hook untuk handle absensi
   - `useGeolocation` - Hook untuk akses GPS

6. **Utility Functions**
   - Format waktu dan tanggal Indonesia
   - Validasi waktu

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 19, Vite, TailwindCSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Styling**: TailwindCSS dengan tema custom

## 📁 Struktur Project

```
src/
├── components/           # Komponen reusable
│   ├── AbsensiModal.jsx
│   ├── Header.jsx
│   ├── Loading.jsx
│   ├── TimeCard.jsx
│   ├── LocationCard.jsx
│   └── index.js         # Export semua komponen
├── contexts/            # React Context
│   └── AuthContext.jsx
├── hooks/               # Custom hooks
│   ├── useAbsensi.js
│   ├── useGeolocation.js
│   └── index.js         # Export semua hooks
├── pages/               # Halaman aplikasi
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   └── siswa/
│       ├── Home.jsx
│       ├── AbsenDatang.jsx
│       ├── AbsenPulang.jsx
│       ├── RiwayatAbsensi.jsx
│       └── IzinSakit.jsx
├── services/            # API services
│   └── api.js
├── utils/               # Utility functions
│   ├── dateTime.js
│   └── index.js         # Export semua utils
├── App.jsx
└── main.jsx
```

## 🎨 Tema Warna

- **Primary**: `#003366` (Biru tua)
- **Secondary**: `#f0ca30` (Kuning emas)
- **Background**: `#f9fafb` (Abu-abu terang)

## 🚀 Cara Menjalankan

### Prerequisites

- Node.js 18+
- npm atau yarn

### Installation

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd web-absensi-smktrimulia
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit file `.env` dan sesuaikan dengan konfigurasi backend:

   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Jalankan development server**

   ```bash
   npm run dev
   ```

5. **Buka browser**
   ```
   http://localhost:5173
   ```

## 📱 Responsive Design

Aplikasi sudah dioptimasi untuk berbagai ukuran layar:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Build untuk Production

```bash
npm run build
```

File hasil build akan tersimpan di folder `dist/`.

## 🧪 Testing

```bash
npm run test
```

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Kontak

- **Developer**: Altaf Fattah Amanullah | Fardias Alfathan
- **Email**: altaf.fattah05@gmail.com | 
- **Project Link**: [https://github.com/username/web-absensi-smktrimulia](https://github.com/username/web-absensi-smktrimulia)

---

**SMK Trimulia** - Sistem Absensi Digital
