import React from 'react'
import { guruAPI } from '../../services/api'
import { Loading } from '../../components';
import Error from '../../components/Error';
export const LihatAbsensiHariIni = () => {
  const [absensi, setAbsensi] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchAbsensi = async () => {
      try {
        const response = await guruAPI.lihatAbsensiHariIni();
        if (response.data.responseStatus) {
          setAbsensi(response.data.responseData.absensi);
        } else {
          setError(response.data.responseMessage || 'Gagal memuat data absensi');
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchAbsensi();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      hadir: 'bg-green-100 text-green-800',
      izin: 'bg-yellow-100 text-yellow-800',
      sakit: 'bg-red-100 text-red-800',
      alpha: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.alpha}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <Loading text="Memuat data siswa..." />;
  if (error) return <Error message={error} />;

  return (
    <div className="flex flex-col p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Absensi Siswa Hari Ini</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">No</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">NIS</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nama</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Kelas</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Jam Datang</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Jam Pulang</th>
            </tr>
          </thead>
          <tbody>
            {absensi.map((item, idx) => (
              <tr key={item.absensi_id} className="border-t">
                <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.siswa.nis}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.siswa.nama}</td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {item.siswa.kelas.tingkat} {item.siswa.kelas.jurusan} {item.siswa.kelas.paralel}
                </td>
                <td className="px-4 py-2">{getStatusBadge(item.status)}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.jam_datang || '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.jam_pulang || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
