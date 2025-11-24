import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../../components';
import { absensiAPI } from '../../services/api';
import { useEffect, useState } from 'react';
const RiwayatAbsensi = () => {
  const { user } = useAuth();
  const [riwayatAbsen, setRiwayatAbsen] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      absensiAPI.riwayat().then((res) => {
        console.log(res.data);  
        setRiwayatAbsen(res.data);
        setLoading(false);
      });
    }
  }, [user]);
  const renderStatusBadge = (status) => {
    const statusClass = {
      hadir: 'bg-green-100 text-green-700 ring-1 ring-green-200',
      izin: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
      sakit: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
      alpha: 'bg-red-100 text-red-700 ring-1 ring-red-200',
      terlambat: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
    };
    return (
      <span
        className={`px-4 py-1.5 inline-flex text-xs font-bold rounded-full leading-5 
          ${statusClass[status] || 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'}`}
      >
        {status}
      </span>
    );
  };
  if (!user) return <Loading text="Memuat data user..." />;
  if (loading) return <Loading text="Memuat riwayat absensi..." />;
  
  return (
    <div className="min-h-screen">
      <Header
        title="Riwayat Absensi"
        subtitle="SMK Trimulia"
        showBackButton
        backPath="/siswa/home"
      />
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Riwayat <span className="text-indigo-600">Kehadiran</span> Anda
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Rekam jejak kehadiran Anda di SMK Trimulia. Selalu pantau untuk hasil terbaik!
          </p>
        </div>
        <div className="relative mt-8 overflow-hidden bg-white shadow-2xl rounded-xl ring-1 ring-gray-200">
          {riwayatAbsen?.responseStatus ? (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead className="table-thead">
                  <tr>
                    {['Tanggal', 'Status', 'Keterangan'].map((col) => (
                      <th key={col} className="table-th">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="table-tbody">
                  {riwayatAbsen.responseData?.map((absen, idx) => (
                    <tr key={idx} className="table-tr hover:bg-indigo-50 transition duration-200 ease-in-out">
                      <td className="table-td">{absen.rencana_absensi.tanggal}</td>
                      <td className="table-td">{renderStatusBadge(absen.status)}</td>
                      <td className="table-td">
                        {absen.keterangan || (
                          <span className="italic text-gray-400">Tidak ada keterangan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Kalo data absen kosong /  belum ada
            <div className="p-8 text-center bg-white shadow-md rounded-xl">
              <svg
                className="w-16 h-16 mx-auto text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172A4 4 0 0111.313 15h2.378a4 4 0 012.141 1.172M17 12a5 5 0 
                  11-10 0 5 5 0 0110 0z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Belum ada riwayat absensi
              </h3>
              <p className="mt-2 text-base text-gray-600">
                Data kehadiran Anda belum tersedia. Silakan cek kembali nanti atau hubungi admin
                jika ini adalah kesalahan.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 mt-6 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Segarkan Halaman
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RiwayatAbsensi;
