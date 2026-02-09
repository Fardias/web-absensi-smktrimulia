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
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="mx-auto max-w-md">
          {/* Header Skeleton */}
          <div className="px-4 pt-8 pb-6 bg-gradient-to-br from-[#4A90E2] to-[#357ABD]">
            <div className="text-white text-center">
              <div className="h-8 bg-white bg-opacity-20 rounded w-32 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-white bg-opacity-20 rounded w-24 mx-auto animate-pulse"></div>
            </div>
          </div>

          <main className="px-4 py-8">
            {/* Profile Card Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 animate-pulse">
              {/* Avatar Skeleton */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
                <div className="h-7 bg-gray-200 rounded w-40 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>

              {/* Info Cards Skeleton */}
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-5 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Skeleton */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center animate-pulse">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 mx-auto mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>

            {/* School Info Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-200 mr-3"></div>
                <div className="h-6 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout Button Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </main>

          <BottomNavbar />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Max width wrapper untuk tampilan mobile-like di semua device */}
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="px-4 pt-8 pb-6 bg-gradient-to-br from-[#4A90E2] to-[#357ABD]">
          <div className="text-white text-center">
            <p className="text-2xl font-bold">Profil Saya</p>
            <p className="text-sm opacity-90">SMK Trimulia</p>
          </div>
        </div>

        <main className="px-4 py-8">
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

        {/* Student Info Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
              <School className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Informasi Siswa</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Kelas</span>
              <span className="font-medium text-gray-900">
                {profile?.kelas?.tingkat || '-'} {profile?.kelas?.jurusan?.nama_jurusan || ''} {profile?.kelas?.paralel || ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Wali Kelas</span>
              <span className="font-medium text-gray-900">
                {profile?.kelas?.walas?.nama || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Aktif
              </span>
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
    </div>
  );
}
