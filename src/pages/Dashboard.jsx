// Dashboard.jsx
import { useAuth } from '../contexts/AuthContext';
import { Header, Loading } from '../components';
import { formatDate } from '../utils';
import { useState, useEffect } from 'react';
import { useDataSiswa } from '../hooks/useDataSiswa';
import { useCountUp } from '../hooks';

const Dashboard = () => {
  const { user } = useAuth();

  const [totalSiswa, setTotalSiswa] = useState(0);
  const [hadirHariIni, setHadirHariIni] = useState(0);
  const [terlambat, setTerlambat] = useState(0);
  const [izinSakit, setIzinSakit] = useState(0);

  const animTotalSiswa = useCountUp(totalSiswa, 500);
  const animHadir = useCountUp(hadirHariIni, 500);
  const animTerlambat = useCountUp(terlambat, 500);
  const animIzin = useCountUp(izinSakit, 500);

  const { handleTotalSiswa, handleSiswaHadirHariIni, handleSiswaTerlambat, handleSiswaIzinSakit } = useDataSiswa();

  useEffect(() => {
    const fetchTotalSiswa = async () => {
      try {
        const cTotalSiswa = await handleTotalSiswa();
        const cHadirHariIni = await handleSiswaHadirHariIni();
        const cTerlambat = await handleSiswaTerlambat();
        const cIzinsakit = await handleSiswaIzinSakit();
        
        setHadirHariIni(cHadirHariIni || 0);
        setTerlambat(cTerlambat || 0);
        setIzinSakit(cIzinsakit || 0);
        setTotalSiswa(cTotalSiswa);
      
      } catch (err) {
        console.error('Error fetch total siswa:', err);
      }
    };

    fetchTotalSiswa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'gurket': return 'Guru Piket';
      case 'walas': return 'Wali Kelas';
      default: return role;
    }
  };

  if (!user) {
    return <Loading text="Memuat data user..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" subtitle="SMK Trimulia" />

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Selamat datang, {user.username}!
          </h2>
          <p className="text-gray-600">
            Dashboard {getRoleDisplayName(user.role)} - {formatDate(new Date())}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Siswa */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold text-gray-900">{animTotalSiswa}</p>
              </div>
            </div>
          </div>

          {/* Hadir Hari Ini */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hadir Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">{animHadir}</p>
              </div>
            </div>
          </div>

          {/* Terlambat */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Terlambat</p>
                <p className="text-2xl font-bold text-gray-900">{animTerlambat}</p>
              </div>
            </div>
          </div>

          {/* Izin / Sakit */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Izin/Sakit</p>
                <p className="text-2xl font-bold text-gray-900">{animIzin}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Aksi Cepat</h3>
            <div className="space-y-3">
              {user.role === 'admin' && (
                <>
                  <button className="w-full text-left p-3 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition duration-200">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Rekap Kehadiran
                    </div>
                  </button>
                  <button className="w-full p-3 text-left text-gray-700 transition duration-200 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Pengaturan Sistem
                    </div>
                  </button>
                </>
              )}

              {user.role === 'gurket' && (
                <>
                  <button className="w-full text-left p-3 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition duration-200">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                      Kelola Siswa
                    </div>
                  </button>
                  <button className="w-full p-3 text-left text-gray-700 transition duration-200 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Laporan Kehadiran
                    </div>
                  </button>
                </>
              )}

              {user.role === 'walas' && (
                <>
                  <button className="w-full text-left p-3 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition duration-200">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      Laporan Kelas
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Aktivitas Terbaru */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Aktivitas Terbaru
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-2 h-2 mr-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Siswa baru melakukan absensi</p>
                  <p className="text-xs text-gray-500">2 menit yang lalu</p>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-2 h-2 mr-3 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Siswa terlambat masuk</p>
                  <p className="text-xs text-gray-500">5 menit yang lalu</p>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-2 h-2 mr-3 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Laporan kehadiran diupdate</p>
                  <p className="text-xs text-gray-500">10 menit yang lalu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
