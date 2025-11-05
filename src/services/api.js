import axios from 'axios';

// Base URL untuk API
const API_BASE_URL = 'http://localhost:8000/api';

// Buat instance axios
const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		Accept: 'application/json',
	},
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		// kalau datanya FormData, hapus Content-Type agar axios yg atur
		if (config.data instanceof FormData) {
			delete config.headers['Content-Type'];
		}

		return config;
	},
	(error) => Promise.reject(error)
);

// Interceptor untuk handle response
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

// Auth API
export const authAPI = {
	login: (credentials) => api.post('/login', credentials),
	logout: () => api.post('/logout'),
	refresh: () => api.post('/refresh'),
	me: () => api.get('/me'),
};

// Absensi API
export const absensiAPI = {
	absen: (data) => api.post('/absensi', data),
	absenPulang: (data) => api.post('/absensi/pulang', data),
	izinSakit: (data) => api.post('/absensi/izinsakit', data),
	riwayat: () => api.get('/absensi/riwayat'),
	riwayatAbsenHariIni: () => api.get('/absensi/hariini'),
};																

// Admin API
export const adminAPI = {
	rekap: () => api.get('/admin/rekap'),
};

// Guru API
export const guruAPI = {
	laporan: () => api.get('/guru/laporan'),
	importSiswa: (formData, onUploadProgress) =>
		api.post('/import-siswa', formData, { onUploadProgress }),
	aktifitasTerbaru: () => api.get('/aktivitas-terbaru'),
	getSiswaIzinSakit: () => api.get('/absensi/siswaIzinSakit'),
	updateAbsensiStatus: (data) => api.post(`/absensi/updateStatus`, data),
	lihatAbsensiSiswa: (params) => api.get('/absensi/lihat', { params }),
	lihatAbsensiHariIni: () => api.get('/absensi/hari-ini'),
	getDataSiswa: () => api.get('/kelola-datasiswa'),
};

// Gabungan Admin dan Guru API
export const generalAPI = {
	totalSiswa: () => api.get('/total-siswa'),
	siswaHadirHariIni: () => api.get('/hadir-hariini'),
	siswaTerlambatHariIni: () => api.get('/terlambat-hariini'),
	siswaIzinHariIni: () => api.get('/izinsakit-hariini'),
};

export const utilityAPI = {
	listKelas: () => api.get('/utillity/getListKelas'),
};


export default api;
