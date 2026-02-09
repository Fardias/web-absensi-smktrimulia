import axios from 'axios';
import { createRateLimiter } from '../utils/validation';

// Base URL untuk API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Rate limiters for different endpoints
const loginRateLimit = createRateLimiter(
  import.meta.env.VITE_LOGIN_RATE_LIMIT || 5, 
  import.meta.env.VITE_RATE_LIMIT_WINDOW || 60000
);
const generalRateLimit = createRateLimiter(
  import.meta.env.VITE_GENERAL_RATE_LIMIT || 100, 
  import.meta.env.VITE_RATE_LIMIT_WINDOW || 60000
);

// Buat instance axios
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000, // 30 second timeout
	withCredentials: true, // Enable cookies for httpOnly
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
});

// Request interceptor untuk security dan rate limiting
api.interceptors.request.use(
	(config) => {
		// Rate limiting check
		const isLoginRequest = config.url?.includes('/login');
		const rateLimitCheck = isLoginRequest ? loginRateLimit() : generalRateLimit();
		
		if (!rateLimitCheck) {
			return Promise.reject({
				response: {
					status: 429,
					data: {
						responseMessage: isLoginRequest 
							? 'Terlalu banyak percobaan login. Coba lagi dalam 1 menit.'
							: 'Terlalu banyak permintaan. Coba lagi nanti.'
					}
				}
			});
		}

		// Token akan dikirim otomatis via httpOnly cookies
		// Tidak perlu manual Authorization header lagi

		// Handle FormData
		if (config.data instanceof FormData) {
			delete config.headers['Content-Type'];
		}

		// Add request timestamp for debugging
		config.metadata = { startTime: new Date() };

		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor untuk error handling
api.interceptors.response.use(
	(response) => {
		// Log response time in development
		if (process.env.NODE_ENV === 'development' && response.config.metadata) {
			const duration = new Date() - response.config.metadata.startTime;
			console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
		}
		return response;
	},
	(error) => {
		const status = error.response?.status;
		const url = error.config?.url || '';

		// Handle different error types
		if (status === 401 && !url.endsWith('/login') && !url.endsWith('/me')) {
			// Token expired or invalid - redirect to login
			// Tapi jangan redirect jika sedang check auth status (/me)
			window.location.href = '/login';
		} else if (status === 403) {
			// Forbidden - insufficient permissions
			console.warn('Access denied:', error.response?.data?.responseMessage);
		} else if (status === 429) {
			// Rate limit exceeded
			console.warn('Rate limit exceeded');
		} else if (status >= 500) {
			// Server error
			console.error('Server error:', error.response?.data);
		} else if (!status) {
			// Network error
			console.error('Network error - check your connection');
		}

		return Promise.reject(error);
	}
);

// Enhanced error handler
export const handleApiError = (error, customMessage = null) => {
	const status = error.response?.status;
	const message = error.response?.data?.responseMessage || error.message;
	
	const errorMessages = {
		400: 'Permintaan tidak valid',
		401: 'Sesi Anda telah berakhir. Silakan login kembali',
		403: 'Anda tidak memiliki akses untuk melakukan tindakan ini',
		404: 'Data tidak ditemukan',
		422: message || 'Data yang dikirim tidak valid',
		429: 'Terlalu banyak permintaan. Coba lagi nanti',
		500: 'Terjadi kesalahan server. Coba lagi nanti',
		502: 'Server sedang maintenance',
		503: 'Layanan tidak tersedia'
	};

	return customMessage || errorMessages[status] || 'Terjadi kesalahan yang tidak diketahui';
};

// Auth API
export const authAPI = {
	login: (credentials) => api.post('/login', credentials),
	logout: () => api.post('/logout'),
	refresh: () => api.post('/refresh'),
	me: () => api.get('/me'),
	profile: () => api.get('/profil'),
	updateProfile: (data) => api.put('/profil', data),
	resetPassword: (data) => api.post('/akun/reset-password', data),
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
	rekap: (params) => api.get('/admin/rekap', { params }),
	getSettings: () => api.get('/admin/pengaturan'),
	updateSettings: (data) => api.put('/admin/pengaturan', data),
	updateMyProfile: (data) => api.put('/admin/profil', data),
	getJurusan: (params) => api.get('/admin/jurusan', { params }),
	createJurusan: (data) => api.post('/admin/jurusan', data),
	updateJurusan: (id, data) => api.put(`/admin/jurusan/${id}`, data),
	deleteJurusan: (id) => api.delete(`/admin/jurusan/${id}`),
	deleteAllJurusan: () => api.delete('/admin/jurusan-delete-all'),

	// Kelas CRUD
	getKelas: () => api.get('/admin/kelas'),
	createKelas: (data) => api.post('/admin/kelas', data),
	updateKelas: (id, data) => api.put(`/admin/kelas/${id}`, data),
	deleteKelas: (id) => api.delete(`/admin/kelas/${id}`),
	deleteAllKelas: () => api.delete('/admin/kelas-delete-all'),
	// getWalas: () => api.get('/admin/walas'),
	// getWaliKelas: () => api.get('/admin/wali-kelas'),

	// Riwayat Kelas
	getRiwayatKelas: (params) => api.get('/admin/riwayat-kelas', { params }),
	updateRiwayatKelas: (id, data) => api.put(`/admin/riwayat-kelas/${id}`, data),
	promoteClass: (kelasId, data) => api.post(`/admin/riwayat-kelas/promote/${kelasId}`, data),

	// Wali Kelas CRUD
	getWaliKelas: () => api.get('/admin/wali-kelas'),
	createWaliKelas: (data) => api.post('/admin/wali-kelas', data),
	updateWaliKelas: (id, data) => api.put(`/admin/wali-kelas/${id}`, data),
	deleteWaliKelas: (id) => api.delete(`/admin/wali-kelas/${id}`),
	deleteAllWaliKelas: () => api.delete('/admin/wali-kelas-delete-all'),

	// Guru Piket CRUD
	getGuruPiket: () => api.get('/admin/guru-piket'),
	createGuruPiket: (data) => api.post('/admin/guru-piket', data),
	updateGuruPiket: (id, data) => api.put(`/admin/guru-piket/${id}`, data),
	deleteGuruPiket: (id) => api.delete(`/admin/guru-piket/${id}`),
	deleteAllGuruPiket: () => api.delete('/admin/guru-piket-delete-all'),
	// getAkunGuruPiket: () => api.get('/admin/akun-gurket'),

	// Jadwal Piket CRUD
	getJadwalPiket: () => api.get('/admin/jadwal-piket'),
	createJadwalPiket: (data) => api.post('/admin/jadwal-piket', data),
	updateJadwalPiket: (id, data) => api.put(`/admin/jadwal-piket/${id}`, data),
	deleteJadwalPiket: (id) => api.delete(`/admin/jadwal-piket/${id}`),
	deleteAllJadwalPiket: () => api.delete('/admin/jadwal-piket-delete-all'),


	importSiswa: (formData, onUploadProgress) =>
		api.post('/admin/import-siswa', formData, { onUploadProgress }),


	getDataSiswa: (params) => api.get('/admin/kelola-datasiswa', { params }),
	createSiswa: (data) => api.post('/admin/kelola-datasiswa/create', data),
	updateSiswa: (siswaId, data) => api.post('/admin/kelola-datasiswa/update', { siswa_id: siswaId, ...data }),
	deleteSiswa: (siswaId) => api.delete(`/admin/kelola-datasiswa/${siswaId}`),
	deleteAllSiswa: () => api.delete('/admin/kelola-datasiswa/delete-all'),
};

// Guru API
export const guruAPI = {
	laporan: () => api.get('/guru/laporan'),
	walasInfo: () => api.get('/walas/info'),

	aktifitasTerbaru: () => api.get('/aktivitas-terbaru'),
	getSiswaIzinSakit: () => api.get('/absensi/siswaIzinSakit'),
	updateAbsensiStatus: (data) => api.post(`/absensi/updateStatus`, data),
	updateAbsensiStatusAll: (data) => api.post(`/absensi/updateAbsensiStatus`, data),
	lihatAbsensiSiswa: (params) => api.get('/absensi/lihat', { params }),
	lihatAbsensiHariIni: () => api.get('/absensi/hari-ini'),

	getRencanaAbsensi: () => api.get('/absensi/rencana'),
	createRencanaAbsensi: (data) => api.post('/absensi/rencana', data),
	updateRencanaStatusHari: (data) => api.post('/absensi/rencana/update-status', data),
};

// Gabungan Admin dan Guru API
export const generalAPI = {
	totalSiswa: () => api.get('/total-siswa'),
	siswaHadirHariIni: () => api.get('/hadir-hariini'),
	siswaTerlambatHariIni: () => api.get('/terlambat-hariini'),
	siswaIzinHariIni: () => api.get('/izin-hariini'),
	siswaSakitHariIni: () => api.get('/sakit-hariini'),
	getPengaturan: () => api.get('/pengaturan'),
};

export const utilityAPI = {
	listKelas: () => api.get('/utility/kelas'),
	getDataSiswa: (params) => api.get('/utility/siswa', { params }),
};


export default api;
