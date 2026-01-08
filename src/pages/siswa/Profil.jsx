import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { authAPI } from "../../services/api";
import { Loading, BottomNavbar } from "../../components";
import { User, School, Calendar, Clock, MapPin } from "lucide-react";
import Swal from "sweetalert2";

export default function SiswaProfil() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await authAPI.profile();
        const profileData = res?.data?.responseData ?? null;
        setProfile(profileData);
      } catch (e) {
        setErr("Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Keluar dari akun?",
      text: "Anda akan mengakhiri sesi dan kembali ke halaman login.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, keluar",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  if (loading && !profile) {
    return <Loading text="Memuat profil..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="px-4 pt-8 pb-6 bg-gradient-to-br from-[#4A90E2] to-[#357ABD]">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-white text-center">
            <p className="text-2xl font-bold">Profil Saya</p>
            <p className="text-sm opacity-90">SMK Trimulia</p>
          </div>
        </div>
      </div>

      <main className="px-4 py-8 mx-auto max-w-2xl">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          {/* Avatar & Basic Info */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#4A90E2] to-[#357ABD] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
              {(profile?.nama || user?.nama || user?.username || "S")
                .charAt(0)
                .toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {profile?.nama || user?.nama || "-"}
            </h2>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              <User className="w-4 h-4 mr-1" />
              Siswa
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-4">
            {/* Username */}
            <div className="flex items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Username</p>
                <p className="text-gray-900 font-semibold">
                  {profile?.username || user?.username || "-"}
                </p>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div className="flex items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Nama Lengkap</p>
                <p className="text-gray-900 font-semibold">
                  {profile?.nama || user?.nama || "-"}
                </p>
              </div>
            </div>

            {/* Kelas */}
            {user?.kelas?.nama && (
              <div className="flex items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
                  <School className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Kelas</p>
                  <p className="text-gray-900 font-semibold">
                    {user.kelas.nama}
                  </p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center p-4 rounded-xl bg-green-50 border border-green-100">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Status</p>
                <p className="text-green-700 font-semibold">Aktif</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric' })}
            </p>
            <p className="text-sm text-gray-500">Hari ini</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-sm text-gray-500">Waktu</p>
          </div>
        </div>

        {/* School Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
              <School className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Informasi Sekolah</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nama Sekolah</span>
              <span className="font-medium text-gray-900">SMK Trimulia</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tahun Ajaran</span>
              <span className="font-medium text-gray-900">2024/2025</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Semester</span>
              <span className="font-medium text-gray-900">Ganjil</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {err && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 text-red-600 mr-2">⚠️</div>
              <p className="text-red-700 font-medium">{err}</p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200 shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
}
