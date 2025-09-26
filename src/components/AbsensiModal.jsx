import { useState, useEffect } from 'react';

const AbsensiModal = ({ isOpen, onClose, type, onAbsen }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [location, setLocation] = useState(null);
    // const [distance, setDistance] = useState(null);

    useEffect(() => {
        if (isOpen) {
            // Reset state ketika modal dibuka
            setResult(null);
            setLoading(false);

            // Ambil lokasi user
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                    }
                );
            }
        }
    }, [isOpen]);

    const handleAbsen = async () => {
        if (!location) {
            setResult({
                success: false,
                message: 'Lokasi tidak dapat diakses. Pastikan GPS aktif.',
                distance: null
            });
            return;
        }

        setLoading(true);

        try {
            const response = await onAbsen({
                latitude: location.latitude,
                longitude: location.longitude
            });

            if (response.success) {
                const successMessage = type === 'datang'
                    ? 'Absensi berhasil. Selamat belajar!'
                    : 'Absensi pulang berhasil. Hati-hati di jalan!';
                setResult({
                    success: true,
                    message: successMessage,
                    distance: null
                });
            } else {
                // Tampilkan pesan error yang spesifik dari backend
                setResult({
                    success: false,
                    message: response.message,
                    distance: response.distance || null
                });
            }
        } catch (error) {
            console.error('Error absen:', error);
            setResult({
                success: false,
                message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
                distance: null
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setResult(null);
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {type === 'datang' ? 'Absen Datang' : 'Absen Pulang'}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!result && !loading && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#003366] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                Konfirmasi Absensi
                            </h4>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin melakukan {type === 'datang' ? 'absen datang' : 'absen pulang'}?
                                {type === 'datang' ? ' Pastikan Anda berada di dalam lingkungan sekolah.' : ' Pastikan Anda berada di dalam lingkungan sekolah.'}
                            </p>

                            {location && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-gray-600 mb-2">Lokasi saat ini:</p>
                                    <p className="text-xs text-gray-500">
                                        Lat: {location.latitude.toFixed(6)}<br />
                                        Lng: {location.longitude.toFixed(6)}
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleAbsen}
                                    disabled={!location}
                                    className="flex-1 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Ya, {type === 'datang' ? 'Absen Datang' : 'Absen Pulang'}
                                </button>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#003366] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                Memproses {type === 'datang' ? 'Absensi Datang' : 'Absensi Pulang'}
                            </h4>
                            <p className="text-gray-600">
                                Mohon tunggu sebentar...
                            </p>
                        </div>
                    )}

                    {result && (
                        <div className="text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.success ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                {result.success ? (
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                )}
                            </div>

                            <h4 className={`text-lg font-medium mb-2 ${result.success ? 'text-green-900' : 'text-red-900'
                                }`}>
                                {result.success ? 'Berhasil!' : 'Gagal!'}
                            </h4>

                            <p className={`mb-4 ${result.success ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {result.message}
                            </p>

                            {result.distance && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-red-700">
                                        Anda berada di radius <span className="font-semibold">{Math.round(result.distance)} meter</span> (batas maksimal: 50 meter).
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleClose}
                                className="w-full px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition duration-200"
                            >
                                Oke
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AbsensiModal;
