import { useAuth } from '../../contexts/AuthContext';
import { Header, Loading } from '../../components';
import { absensiAPI } from '../../services/api';
import { useEffect, useState } from 'react';

const RiwayatAbsensi = () => {
  const { user } = useAuth();
  const [riwayatAbsen, setRiwayatAbsen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      absensiAPI.riwayat().then((data) => {
        setRiwayatAbsen(data.data);
        setLoading(false);
      });
    }
  }, [user]);

  if (!user) {
    return <Loading text="Memuat data user..." />;
  }

  if (loading) {
    return <Loading text="Memuat riwayat absensi..." />;
  }

  console.log(riwayatAbsen);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Riwayat Absensi" 
        subtitle="SMK Trimulia" 
        showBackButton={true}
        backPath="/siswa/home"
      />

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Riwayat Absensi</h2>
        </div>
        <div className="mt-8">
          {riwayatAbsen.responseStatus == true ? (
            <table className="min-w-full text-center bg-white border border-gray-200 rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-center border-b">Tanggal</th>
                  <th className="px-4 py-2 text-center border-b">Status</th>
                  <th className="px-4 py-2 text-center border-b">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {riwayatAbsen.responseData.map((absen, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="px-4 py-2 text-center border-b">{absen.tanggal}</td>
                    <td className="px-4 py-2 text-center border-b">{absen.status}</td>
                    <td className="px-4 py-2 text-center border-b">{absen.keterangan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">Belum ada riwayat absensi.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default RiwayatAbsensi;
