import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAbsensi } from '../../hooks';
import { TimeCard, LocationCard, Loading } from '../../components';
import RiwayatAbsenHarian from '../siswa/RiwayatAbsenHarian';
import { generalAPI } from '../../services/api';

const SiswaHome = () => {
  const { user } = useAuth();
  const { handleAbsen } = useAbsensi();
  const [pengaturan, setPengaturan] = useState(null);
  const [loadingPengaturan, setLoadingPengaturan] = useState(false);
  const [errorPengaturan, setErrorPengaturan] = useState(null);
  const navigate = useNavigate();


  if (!user) {
    return <Loading text="Memuat data user..." />;
  }

  useEffect(() => {
    const fetchPengaturan = async () => {
    try {
      setLoadingPengaturan(true);
      const { data } = await generalAPI.getPengaturan();
      setPengaturan(data);
    } catch (e) {
      setErrorPengaturan(e?.response?.data?.responseMessage || 'Gagal memuat pengaturan');
    } finally {
      setLoadingPengaturan(false);
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

  const canCheckInWindow = useMemo(() => {
    if (!pengaturan?.jam_masuk) return false;
    const today = new Date();
    const [h, m] = pengaturan.jam_masuk.split(':').map((x) => parseInt(x, 10));
    const start = new Date(today);
    start.setHours(h || 0, m || 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + toleransiMenit);
    const now = today.getTime();
    return now >= start.getTime() && now <= end.getTime();
  }, [pengaturan, toleransiMenit]);

  const isWithinCheckOut = useMemo(() => {
    if (!pengaturan?.jam_pulang) return false;
    const today = new Date();
    const [h, m] = pengaturan.jam_pulang.split(':').map((x) => parseInt(x, 10));
    const start = new Date(today);
    start.setHours(h || 0, m || 0, 0, 0);
    return today.getTime() >= start.getTime();
  }, [pengaturan]);

  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Time and Location Card */}
        {/* <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          <TimeCard title="Waktu Saat Ini" showDate={true} />
          <LocationCard />
        </div> */}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Jam Datang & Pulang</h3>
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

        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <button
            className="bg-[#003366] text-white p-6 rounded-xl shadow-sm hover:bg-[#002244] transition duration-200"
            onClick={() => navigate('/siswa/absen-datang')}
          >
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-white rounded-lg bg-opacity-20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-semibold">Absen Datang</h3>
              <p className="text-sm opacity-90">Absen masuk sekolah</p>
            </div>
          </button>

          <button
            className="bg-[#f0ca30] text-[#003366] p-6 rounded-xl shadow-sm hover:bg-[#e6b82a] transition duration-200"
            onClick={() => navigate('/siswa/absen-pulang')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-[#003366] bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-semibold">Absen Pulang</h3>
              <p className="text-sm opacity-90">Absen keluar sekolah</p>
            </div>
          </button>

          <button
            className="p-6 text-gray-700 transition duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50"
            onClick={() => navigate('/siswa/riwayat')}
          >
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-semibold">Riwayat</h3>
              <p className="text-sm text-gray-500">Lihat riwayat absensi</p>
            </div>
          </button>

          <button
            className="p-6 text-gray-700 transition duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50"
            onClick={() => navigate('/siswa/izin')}
          >
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-semibold">Izin/Sakit</h3>
              <p className="text-sm text-gray-500">Ajukan izin atau sakit</p>
            </div>
          </button>
        </div>

        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <RiwayatAbsenHarian />
        </div>
      </main>


    </div>
  );
};

export default SiswaHome;
