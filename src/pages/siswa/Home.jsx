import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading, BottomNavbar } from '../../components';
import RiwayatAbsenHarian from '../siswa/RiwayatAbsenHarian';
import { generalAPI } from '../../services/api';

const SiswaHome = () => {
  const { user } = useAuth();
  const [pengaturan, setPengaturan] = useState(null);
  const [errorPengaturan, setErrorPengaturan] = useState(null);
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
      <div className="px-4 pt-8 pb-10 bg-gradient-to-br from-[#4A90E2] to-[#357ABD]">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-white">
            <p className="text-2xl font-bold">Hai, {user?.nama || user?.username}</p>
            <p className="text-sm opacity-90">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
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

        {/* Action Cards - 2 Column Grid */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Absensi</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Absen Datang */}
            <button
              className="bg-[#003366] text-white p-6 rounded-xl shadow-sm hover:bg-[#002244] transition duration-200 aspect-square flex flex-col items-center justify-center"
              onClick={() => navigate('/siswa/absen-datang')}
            >
              <div className="flex items-center justify-center w-12 h-12 mb-3 bg-white rounded-lg bg-opacity-20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-center">Absen Datang</h3>
              <p className="text-xs opacity-90 text-center">Masuk sekolah</p>
            </button>

            {/* Absen Pulang */}
            <button
              className="bg-[#f0ca30] text-[#003366] p-6 rounded-xl shadow-sm hover:bg-[#e6b82a] transition duration-200 aspect-square flex flex-col items-center justify-center"
              onClick={() => navigate('/siswa/absen-pulang')}
            >
              <div className="w-12 h-12 bg-[#003366] bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-center">Absen Pulang</h3>
              <p className="text-xs opacity-90 text-center">Keluar sekolah</p>
            </button>

            {/* Izin/Sakit - Spans 2 columns */}
            <button
              className="col-span-2 p-6 text-gray-700 transition duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50"
              onClick={() => navigate('/siswa/izin')}
            >
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center w-12 h-12 mr-4 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Izin / Sakit</h3>
                  <p className="text-sm text-gray-500">Ajukan permohonan izin atau sakit</p>
                </div>
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
  );
};

export default SiswaHome;
