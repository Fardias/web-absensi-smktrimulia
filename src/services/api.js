import axios from 'axios';

// Base URL untuk API
const API_BASE_URL = 'http://localhost:8000/api';
// const API_BASE_URL = 'http://192.168.100.7:8000/api';

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
		const status = error.response?.status;
		const url = error.config?.url || '';
		const hasToken = !!localStorage.getItem('token');
		if (status === 401 && hasToken && !url.endsWith('/login')) {
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

	// Kelas CRUD
	getKelas: () => api.get('/admin/kelas'),
	createKelas: (data) => api.post('/admin/kelas', data),
	updateKelas: (id, data) => api.put(`/admin/kelas/${id}`, data),
	deleteKelas: (id) => api.delete(`/admin/kelas/${id}`),
	// getWalas: () => api.get('/admin/walas'),
	getWaliKelas: () => api.get('/admin/wali-kelas'),

	// Riwayat Kelas
	getRiwayatKelas: (params) => api.get('/admin/riwayat-kelas', { params }),
	updateRiwayatKelas: (id, data) => api.put(`/admin/riwayat-kelas/${id}`, data),
	promoteClass: (kelasId, data) => api.post(`/admin/riwayat-kelas/promote/${kelasId}`, data),

	// Wali Kelas CRUD
	getWaliKelas: () => api.get('/admin/wali-kelas'),
	createWaliKelas: (data) => api.post('/admin/wali-kelas', data),
	updateWaliKelas: (id, data) => api.put(`/admin/wali-kelas/${id}`, data),
	deleteWaliKelas: (id) => api.delete(`/admin/wali-kelas/${id}`),

	// Guru Piket CRUD
	getGuruPiket: () => api.get('/admin/guru-piket'),
	createGuruPiket: (data) => api.post('/admin/guru-piket', data),
	updateGuruPiket: (id, data) => api.put(`/admin/guru-piket/${id}`, data),
	deleteGuruPiket: (id) => api.delete(`/admin/guru-piket/${id}`),
	// getAkunGuruPiket: () => api.get('/admin/akun-gurket'),

	// Jadwal Piket CRUD
	getJadwalPiket: () => api.get('/admin/jadwal-piket'),
	createJadwalPiket: (data) => api.post('/admin/jadwal-piket', data),
	updateJadwalPiket: (id, data) => api.put(`/admin/jadwal-piket/${id}`, data),
	deleteJadwalPiket: (id) => api.delete(`/admin/jadwal-piket/${id}`),


	importSiswa: (formData, onUploadProgress) =>
		api.post('/admin/import-siswa', formData, { onUploadProgress }),


	getDataSiswa: (params) => api.get('/admin/kelola-datasiswa', { params }),
	createSiswa: (data) => api.post('/admin/kelola-datasiswa/create', data),
	updateSiswa: (siswaId, data) => api.post('/admin/kelola-datasiswa/update', { siswa_id: siswaId, ...data }),
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
