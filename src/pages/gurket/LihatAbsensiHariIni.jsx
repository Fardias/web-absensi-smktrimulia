import React from 'react'
import { guruAPI, utilityAPI } from '../../services/api'
import { Loading } from '../../components';
import Error from '../../components/Error';

export const LihatAbsensiHariIni = () => {
  const [absensi, setAbsensi] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [kelasList, setKelasList] = React.useState([]);
  const [kelas, setKelas] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [tanggal] = React.useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await utilityAPI.listKelas();
        const data = res?.data?.responseData ?? [];
        const list = data.map((k) => ({
          id: k.kelas_id,
          label: `${k.tingkat} ${k.jurusan?.nama_jurusan ?? k.jurusan} ${k.paralel}`,
        }));
        setKelasList(list);
      } catch {
        setKelasList([]);
      }
    };
    fetchKelas();
  }, []);

  const fetchAbsensi = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { tanggal };
      if (kelas) params.kelas_id = kelas;
      if (status) params.status = status;
      const res = await guruAPI.lihatAbsensiSiswa(params);
      const data = res?.data?.responseData?.absensi ?? [];
      setAbsensi(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat data');
      setAbsensi([]);
    } finally {
      setLoading(false);
    }
  }, [kelas, status, tanggal]);

  React.useEffect(() => {
    fetchAbsensi();
  }, [fetchAbsensi]);

  const getStatusBadge = (status) => {
    const styles = {
      hadir: 'bg-green-100 text-green-800',
      terlambat: 'bg-yellow-100 text-yellow-800',
      izin: 'bg-yellow-100 text-yellow-800',
      sakit: 'bg-red-100 text-red-800',
      alfa: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.alfa}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const filtered = absensi.filter((item) => {
    if (status && String(item.status).toLowerCase() !== String(status).toLowerCase()) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const nis = String(item.nis || "").toLowerCase();
    const nama = String(item.nama || "").toLowerCase();
    return nis.includes(q) || nama.includes(q);
  });

  if (loading) return <Loading text="Loading..." />;
  if (error) return <Error message={error} />;

  return (
    <div className="flex flex-col p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Absensi Siswa Hari Ini</h1>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter Kelas</label>
          <select
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
           </select>
        </div>
        <div className="md:col-span-2 flex items-end justify-end gap-2">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran</label>
            <div className="flex flex-wrap gap-2 justify-end">
              {['', 'hadir', 'terlambat', 'izin', 'sakit', 'alfa'].map((s) => (
                <button
                  key={s || 'semua'}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-md text-sm border ${status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Semua'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari NIS/Nama</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Masukkan NIS atau nama siswa"
              className="w-56 border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <button
            onClick={() => { setKelas(''); setStatus(''); setSearch(''); }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            Reset Filter
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-600 mb-2">
        {kelas ? (
          <>Filter kelas: {kelasList.find((k) => String(k.id) === String(kelas))?.label}</>
        ) : (
          <>Filter kelas: Semua</>
        )}
        {' '}• Status: {status ? status : 'Semua'}
      </div>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead className="table-thead">
            <tr>
              <th className="table-th">No</th>
              <th className="table-th">NIS</th>
              <th className="table-th">Nama</th>
              <th className="table-th">Kelas</th>
              <th className="table-th">Status</th>
              <th className="table-th">Jam Datang</th>
              <th className="table-th">Jam Pulang</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {filtered.length === 0 ? (
              <tr>
                <td className="table-td text-center" colSpan={7}>
                  {status
                    ? `Belum ada data siswa yang ${status}`
                    : 'Belum ada data absensi hari ini'}
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => (
                <tr key={item.absensi_id ?? `${item.nis}-${idx}`} className="table-tr">
                  <td className="table-td">{idx + 1}</td>
                  <td className="table-td">{item.nis}</td>
                  <td className="table-td">{item.nama}</td>
                  <td className="table-td">
                    {item.tingkat} {item.jurusan?.nama_jurusan ?? item.jurusan} {item.paralel}
                  </td>
                  <td className="table-td">{getStatusBadge(item.status)}</td>
                  <td className="table-td">{item.jam_datang || '-'}</td>
                  <td className="table-td">{item.jam_pulang || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
