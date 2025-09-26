import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAbsensi } from '../../hooks';
import { AbsensiModal, Header, TimeCard, LocationCard, Loading } from '../../components';

const SiswaHome = () => {
  const { user } = useAuth();
  const { handleAbsen } = useAbsensi();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const navigate = useNavigate();

  const handleAbsenWrapper = async (data) => {
    return await handleAbsen(modalType, data);
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  if (!user) {
    return <Loading text="Memuat data user..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Absensi Siswa"
        subtitle="SMK Trimulia"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat datang, {user.username}!
          </h2>
        </div>

        {/* Time and Location Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TimeCard title="Waktu Saat Ini" showDate={true} />
          <LocationCard />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            className="bg-[#003366] text-white p-6 rounded-xl shadow-sm hover:bg-[#002244] transition duration-200"
            onClick={() => openModal('datang')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-1">Absen Datang</h3>
              <p className="text-sm opacity-90">Absen masuk sekolah</p>
            </div>
          </button>

          <button
            className="bg-[#f0ca30] text-[#003366] p-6 rounded-xl shadow-sm hover:bg-[#e6b82a] transition duration-200"
            onClick={() => openModal('pulang')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-[#003366] bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-1">Absen Pulang</h3>
              <p className="text-sm opacity-90">Absen keluar sekolah</p>
            </div>
          </button>

          <button
            className="bg-white text-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition duration-200"
            onClick={() => navigate('/siswa/riwayat')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-1">Riwayat</h3>
              <p className="text-sm text-gray-500">Lihat riwayat absensi</p>
            </div>
          </button>

          <button
            className="bg-white text-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition duration-200"
            onClick={() => navigate('/siswa/izin')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-1">Izin/Sakit</h3>
              <p className="text-sm text-gray-500">Ajukan izin atau sakit</p>
            </div>
          </button>
        </div>

        {/* Status Absensi Hari Ini */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Absensi Hari Ini</h3>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">Belum ada absensi hari ini</p>
            <p className="text-sm text-gray-400 mt-1">Silakan lakukan absensi datang terlebih dahulu</p>
          </div>
        </div>
      </main>

      {/* Modal */}
      <AbsensiModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        onAbsen={handleAbsenWrapper}
      />
    </div>
  );
};

export default SiswaHome;

