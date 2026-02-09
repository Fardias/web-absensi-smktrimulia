import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading, BottomNavbar } from '../../components';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import RiwayatAbsenHarian from '../siswa/RiwayatAbsenHarian';
import { generalAPI, authAPI } from '../../services/api';

const SiswaHome = () => {
  const { user } = useAuth();
  const [pengaturan, setPengaturan] = useState(null);
  const [errorPengaturan, setErrorPengaturan] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();


  if (!user) {
    return <Loading text="Memuat data user..." />;
  }

  useEffect(() => {
    const fetchPengaturan = async () => {
    try {
      const response = await generalAPI.getPengaturan();
      // Fix: Access responseData instead of data directly
      const pengaturanData = response.data?.responseData || response.data;
      setPengaturan(pengaturanData);
    } catch (e) {
      setErrorPengaturan(e?.response?.data?.responseMessage || 'Gagal memuat pengaturan');
    }
  };
  fetchPengaturan();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.profile();
        const profileData = res?.data?.responseData ?? null;
        console.log("profil data", profileData);
        
        setProfile(profileData);
      } catch (e) {
        // Silent fail, use user data as fallback
      }
    };
    fetchProfile();
  }, []);

  const formatJam = (jam) => {
    if (!jam) return '-';
    const parts = jam.split(':');
    return `${String(parts[0] || '').padStart(2, '0')}:${String(parts[1] || '').padStart(2, '0')}`;
  };

  const jamMasuk = useMemo(() => formatJam(pengaturan?.jam_masuk), [pengaturan]);
  const jamPulang = useMemo(() => formatJam(pengaturan?.jam_pulang), [pengaturan]);
  const toleransiMenit = pengaturan?.toleransi_telat ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Max width wrapper untuk tampilan mobile-like di semua device */}
      <div className="mx-auto max-w-md">
        <div className="px-4 pt-8 pb-10 bg-gradient-to-br from-[#4A90E2] to-[#357ABD] rounded-b-3xl">
          <div className="text-white">
            <p className="text-2xl font-bold">Hai, {profile?.nama || user?.nama || user?.username}</p>
            <p className="text-sm opacity-90">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <main className="px-4 py-8">
          {/* Jam Datang & Pulang Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Jam Datang & Pulang</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <p className="text-sm text-gray-600">Batas jam Datang</p>
                <p className="text-2xl font-bold text-[#003366]">{jamMasuk}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <p className="text-sm text-gray-600">Jam Pulang</p>
                <p className="text-2xl font-bold text-[#003366]">{jamPulang}</p>
              </div>
            </div>
            {pengaturan && (
              <p className="mt-2 text-sm font-medium text-[#357ABD]">Toleransi keterlambatan: {toleransiMenit} menit</p>
            )}
            {errorPengaturan && (
              <p className="mt-2 text-sm font-semibold text-red-600">{errorPengaturan}</p>
            )}
          </div>

          {/* Action Cards - 3 Horizontal Cards */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Absensi</h3>
            <div className="space-y-3">
              {/* Absen Datang */}
              <button
                className="w-full bg-[#003366] text-white p-5 rounded-2xl shadow-md hover:bg-[#002244] transition duration-200 flex items-center"
                onClick={() => navigate('/siswa/absen-datang')}
              >
                <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl bg-opacity-20 mr-4 flex-shrink-0">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-0.5">Absen Datang</h3>
                  <p className="text-sm opacity-90">Masuk sekolah</p>
                </div>
              </button>

              {/* Absen Pulang */}
              <button
                className="w-full bg-[#f0ca30] text-[#003366] p-5 rounded-2xl shadow-md hover:bg-[#e6b82a] transition duration-200 flex items-center"
                onClick={() => navigate('/siswa/absen-pulang')}
              >
                <div className="w-14 h-14 bg-[#003366] bg-opacity-20 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-0.5">Absen Pulang</h3>
                  <p className="text-sm opacity-90">Keluar sekolah</p>
                </div>
              </button>

              {/* Izin/Sakit */}
              <button
                className="w-full p-5 text-gray-700 transition duration-200 bg-white border border-gray-200 shadow-md rounded-2xl hover:bg-gray-50 flex items-center"
                onClick={() => navigate('/siswa/izin')}
              >
                <div className="flex items-center justify-center w-14 h-14 bg-orange-100 rounded-xl mr-4 flex-shrink-0">
                  <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-0.5">Izin / Sakit</h3>
                  <p className="text-sm text-gray-500">Ajukan permohonan izin atau sakit</p>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <RiwayatAbsenHarian />
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavbar />
      </div>
    </div>
  );
};

export default SiswaHome;
