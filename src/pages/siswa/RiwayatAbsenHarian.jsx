import React, { useEffect, useState } from 'react';
import { absensiAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const RiwayatAbsenHarian = () => {
    const [riwayat, setRiwayat] = useState(null);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // Objek untuk memetakan status ke kelas warna Tailwind
    const statusColors = {
        hadir: 'bg-green-100 text-green-700',
        izin: 'bg-yellow-100 text-yellow-700',
        sakit: 'bg-blue-100 text-blue-700',
        alpha: 'bg-red-100 text-red-700',
        terlambat: 'bg-orange-100 text-orange-700',
    };

    useEffect(() => {
        if (user) {
            absensiAPI.riwayatAbsenHariIni().then((res) => {
                if (res.data.responseStatus) {
                    setRiwayat(res.data.responseData);
                } else {
                    setRiwayat(null);
                }
                setLoading(false);
            }).catch(error => {
                console.error("Error fetching daily attendance history:", error);
                setRiwayat(null);
                setLoading(false);
            });
        }
    }, [user]);

    if (loading) {
        return <p className="text-center text-gray-500">Memuat...</p>;
    }

    // Tentukan kelas warna berdasarkan status riwayat
    const cardClasses = riwayat
        ? `p-6 text-center shadow rounded-xl ${statusColors[riwayat.status.toLowerCase()] || 'bg-gray-100 text-gray-700'}`
        : 'p-6 text-center shadow rounded-xl bg-gray-100 text-gray-700'; // Default jika tidak ada riwayat atau status tidak dikenali

    return (
        <>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Status Absensi Hari Ini
            </h3>

            {!riwayat ? (
                <div className="py-8 text-center">
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <p className="text-lg text-gray-500">Belum ada absensi hari ini</p>
                    <p className="mt-1 text-sm text-gray-400">
                        Silakan lakukan absensi datang terlebih dahulu
                    </p>
                </div>
            ) : (
                <div className={cardClasses}> {/* Gunakan cardClasses di sini */}
                    <p className="text-xl font-semibold capitalize">
                        Status: {riwayat.status}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                        Tanggal: {riwayat.tanggal}
                    </p>

                    {/* Jika ada jam datang / pulang */}
                    {riwayat.jam_datang && (
                        <p className="text-sm text-gray-600">Datang: {riwayat.jam_datang}</p>
                    )}
                    {riwayat.jam_pulang && (
                        <p className="text-sm text-gray-600">Pulang: {riwayat.jam_pulang}</p>
                    )}

                    {/* Jika ada bukti upload */}
                    {riwayat.bukti && (
                        <div className="mt-3">
                            {riwayat.bukti.match(/\.(jpg|jpeg|png)$/i) ? (
                                <img
                                    src={riwayat.bukti}
                                    alt="Bukti"
                                    className="object-cover w-32 h-32 mx-auto border rounded-lg"
                                />
                            ) : (
                                <a
                                    href={riwayat.bukti}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    Lihat bukti
                                </a>
                            )}
                        </div>
                    )}

                </div>
            )}
        </>
    );
};

export default RiwayatAbsenHarian;