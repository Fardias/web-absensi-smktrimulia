import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAbsensi } from '../../hooks';
import { AbsensiModal, TimeCard, LocationCard, Loading } from '../../components';


const AbsenDatang = () => {
    const { user } = useAuth();
    const { handleAbsen } = useAbsensi();
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleAbsenWrapper = async (data) => {
        return await handleAbsen('datang', data);
    };

    if (!user) {
        return <Loading text="Memuat data user..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="Absen Datang"
                subtitle="SMK Trimulia"
                showBackButton={true}
                backPath="/siswa/home"
            />

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Time and Location Card */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <TimeCard title="Waktu Saat Ini" showDate={true} />
                    <LocationCard />
                </div>

                {/* Absen Button */}
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
                    <div className="w-24 h-24 bg-[#003366] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Absen Datang
                    </h3>

                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Klik tombol di bawah untuk melakukan absensi datang. Pastikan Anda berada di dalam lingkungan sekolah.
                    </p>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#003366] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#002244] transition duration-200 shadow-lg"
                    >
                        Absen Datang
                    </button>
                </div>

                {/* Info Card */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">
                                Informasi Penting
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Absensi hanya dapat dilakukan di dalam radius 50 meter dari sekolah</li>
                                <li>• Pastikan GPS aktif dan browser mengizinkan akses lokasi</li>
                                <li>• Absensi datang dapat dilakukan mulai pukul 06:00 WIB</li>
                                <li>• Jika terlambat, status akan otomatis berubah menjadi "Terlambat"</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            <AbsensiModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                type="datang"
                onAbsen={handleAbsenWrapper}
            />
        </div>
    );
};

export default AbsenDatang;