import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SiswaHome from "./pages/siswa/Home";
import AbsenDatang from "./pages/siswa/AbsenDatang";
import AbsenPulang from "./pages/siswa/AbsenPulang";
import RiwayatAbsensi from "./pages/siswa/RiwayatAbsensi";
import IzinSakit from "./pages/siswa/IzinSakit";
import ImportSiswa from "./pages/admin/ImportSiswa";
import SiswaIzinSakit from "./pages/gurket/SiswaIzinSakit";
import LihatAbsensi from "./pages/gurket/LihatAbsensi";
import { LihatAbsensiHariIni } from "./pages/gurket/LihatAbsensiHariIni";
import KelolaDataSiswa from "./pages/admin/KelolaDataSiswa";
import RencanaAbsensi from "./pages/gurket/RencanaAbsensi";
import AdminRekap from "./pages/admin/Rekap";
import AdminPengaturan from "./pages/admin/Pengaturan";
import RekapWalas from "./pages/walas/RekapWalas";
import Profil from "./pages/Profil";
import Jurusan from "./pages/admin/Jurusan";
import Kelas from "./pages/admin/Kelas";
import WaliKelas from "./pages/admin/WaliKelas";
import GuruPiket from "./pages/admin/GuruPiket";
import JadwalPiket from "./pages/admin/JadwalPiket";
import RiwayatKelas from "./pages/admin/RiwayatKelas";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Unauthorized Page
const Unauthorized = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full">
        <svg
          className="w-10 h-10 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856
            c1.54 0 2.502-1.667 1.732-2.5L13.732
            4c-.77-.833-1.964-.833-2.732
            0L3.732 16.5c-.77.833.192
            2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Akses Ditolak</h1>
      <p className="mb-4 text-gray-600">
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-[#002244] transition duration-200"
      >
        Kembali
      </button>
    </div>
  </div>
);

// Main Routes
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={user.role === "siswa" ? "/siswa/home" : "/dashboard"}
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "gurket", "walas"]}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/import-siswa"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <ImportSiswa />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/absensi-hari-ini"
        element={
          <ProtectedRoute allowedRoles={["gurket"]}>
            <Layout>
              <LihatAbsensiHariIni />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/siswa-izinsakit"
        element={
          <ProtectedRoute allowedRoles={["gurket"]}>
            <Layout>
              <SiswaIzinSakit />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/lihat-absensi"
        element={
          <ProtectedRoute allowedRoles={["gurket"]}>
            <Layout>
              <LihatAbsensi />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/kelola-siswa"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <KelolaDataSiswa />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/riwayat-kelas"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <RiwayatKelas />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/rencana-absensi"
        element={
          <ProtectedRoute allowedRoles={["gurket"]}>
            <Layout>
              <RencanaAbsensi />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin (Kepala Sekolah) Routes */}
      <Route
        path="/dashboard/rekap"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <AdminRekap />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Wali Kelas Routes */}
      <Route
        path="/dashboard/rekap-walas"
        element={
          <ProtectedRoute allowedRoles={["walas"]}>
            <Layout>
              <RekapWalas />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/pengaturan"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <AdminPengaturan />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/jurusan"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <Jurusan />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/kelas"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <Kelas />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/wali-kelas"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <WaliKelas />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/guru-piket"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <GuruPiket />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/jadwal-piket"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <JadwalPiket />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Profil Route */}
      <Route
        path="/profil"
        element={
          <ProtectedRoute allowedRoles={["admin", "kepala_sekolah", "gurket", "walas", "siswa"]}>
            <Layout>
              <Profil />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Siswa Routes */}
      <Route
        path="/siswa/home"
        element={
          <ProtectedRoute allowedRoles={["siswa"]}>
            <SiswaHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/siswa/absen-datang"
        element={
          <ProtectedRoute allowedRoles={["siswa"]}>
            <AbsenDatang />
          </ProtectedRoute>
        }
      />
      <Route
        path="/siswa/absen-pulang"
        element={
          <ProtectedRoute allowedRoles={["siswa"]}>
            <AbsenPulang />
          </ProtectedRoute>
        }
      />
      <Route
        path="/siswa/riwayat"
        element={
          <ProtectedRoute allowedRoles={["siswa"]}>
            <RiwayatAbsensi />
          </ProtectedRoute>
        }
      />
      <Route
        path="/siswa/izin"
        element={
          <ProtectedRoute allowedRoles={["siswa"]}>
            <IzinSakit />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized Route */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />



      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9
                    12h6m-6-4h6m2 5.291A7.962 7.962
                    0 0112 15c-2.34 0-4.29-1.009-5.824-2.709"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Halaman Tidak Ditemukan
              </h1>
              <p className="mb-4 text-gray-600">
                Halaman yang Anda cari tidak ada.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-[#002244] transition duration-200"
              >
                Kembali
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

// Root App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
