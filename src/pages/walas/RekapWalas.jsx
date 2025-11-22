import { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { guruAPI } from "../../services/api";

const formatDateInput = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function RekapWalas() {
  const { user } = useAuth();
  const [tanggal, setTanggal] = useState(() => new Date());
  const [walasInfo, setWalasInfo] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const counts = useMemo(() => {
    const c = { hadir: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0 };
    list.forEach((row) => {
      const s = (row.status || '').toLowerCase();
      if (c[s] !== undefined) c[s] += 1;
    });
    return c;
  }, [list]);

  const fetchInfo = async () => {
    if (user?.role !== 'walas') return;
    try {
      const res = await guruAPI.walasInfo();
      const data = res?.data?.responseData || res?.data?.data || null;
      setWalasInfo(data);
    } catch {
      setWalasInfo(null);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await guruAPI.lihatAbsensiSiswa({ tanggal: formatDateInput(tanggal) });
      const payload = res?.data?.responseData || res?.data || {};
      const arr = payload?.absensi || [];
      setList(Array.isArray(arr) ? arr : []);
    } catch {
      setError("Gagal memuat rekap kelas wali.");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInfo(); }, [user?.role]);
  useEffect(() => { fetchList(); }, [tanggal]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rekap Absensi Kelas Wali</h2>
              <p className="text-sm text-gray-600">{walasInfo?.kelas_label || 'Memuat info kelas...'}</p>
            </div>
            <input
              type="date"
              value={formatDateInput(tanggal)}
              onChange={(e) => setTanggal(new Date(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { key: 'hadir', label: 'Hadir', color: 'bg-green-100 text-green-700', value: counts.hadir },
            { key: 'terlambat', label: 'Terlambat', color: 'bg-yellow-100 text-yellow-700', value: counts.terlambat },
            { key: 'izin', label: 'Izin', color: 'bg-blue-100 text-blue-700', value: counts.izin },
            { key: 'sakit', label: 'Sakit', color: 'bg-red-100 text-red-700', value: counts.sakit },
            { key: 'alfa', label: 'Alfa', color: 'bg-gray-100 text-gray-700', value: counts.alfa },
          ].map((card) => (
            <div key={card.key} className={`p-4 rounded-xl border border-gray-200 shadow-sm ${card.color}`}>
              <p className="text-sm font-medium">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <p className="p-4 text-sm text-gray-500">Memuat data rekap...</p>
            ) : error ? (
              <p className="p-4 text-sm text-red-600">{error}</p>
            ) : list.length === 0 ? (
              <p className="table-empty">Tidak ada data absensi untuk tanggal ini.</p>
            ) : (
              <table className="table-base">
                <thead className="table-thead">
                  <tr>
                    <th className="table-th">NIS</th>
                    <th className="table-th">Nama</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Jam Datang</th>
                    <th className="table-th">Jam Pulang</th>
                  </tr>
                </thead>
                <tbody className="table-tbody">
                  {list.map((row, idx) => (
                    <tr key={idx} className="table-tr hover:bg-gray-50">
                      <td className="table-td">{row.nis || '-'}</td>
                      <td className="table-td">{row.nama || '-'}</td>
                      <td className="table-td capitalize">{row.status || '-'}</td>
                      <td className="table-td">{row.jam_datang || '-'}</td>
                      <td className="table-td">{row.jam_pulang || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}