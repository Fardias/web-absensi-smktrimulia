import { useEffect, useMemo, useState } from "react";
import { Loading } from "../../components";
import { adminAPI, utilityAPI } from "../../services/api";

const formatDateInput = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const startOfWeek = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfWeek = (d) => {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

export default function AdminRekap() {
  const [period, setPeriod] = useState("harian");
  const [baseDate, setBaseDate] = useState(() => new Date());
  const [rekap, setRekap] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [kelasFilter, setKelasFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const range = useMemo(() => {
    if (period === "harian") {
      return {
        period,
        tanggal: formatDateInput(baseDate),
      };
    }
    if (period === "mingguan") {
      const s = startOfWeek(baseDate);
      const e = endOfWeek(baseDate);
      return {
        period,
        start: formatDateInput(s),
        end: formatDateInput(e),
      };
    }
    const s = startOfMonth(baseDate);
    const e = endOfMonth(baseDate);
    return {
      period: "bulanan",
      start: formatDateInput(s),
      end: formatDateInput(e),
    };
  }, [period, baseDate]);

  const fetchKelas = async () => {
    try {
      const res = await utilityAPI.listKelas();
      const data = res?.data?.responseData || [];
      const list = data.map((k) => (
        { 
          id: k.kelas_id, 
          label: `${k.tingkat} ${k.jurusan} ${k.paralel || ""}`.trim() 
        }
      ));
      setKelasList(list);
    } catch (e) {
      // Fallback: tetap lanjut tanpa list kelas
      setKelasList([]);
    }
  };

  const fetchRekap = async () => {
    setLoading(true);
    setError("");
    try {
      // Helper untuk agregasi multi hari
      const aggregate = (lists) => {
        const map = new Map();
        lists.flat().forEach((row) => {
          const key = row.kelas || row.kelas_nama || '-';
          if (!map.has(key)) {
            map.set(key, {
              kelas: key,
              hadir: 0,
              terlambat: 0,
              izin: 0,
              sakit: 0,
              alfa: 0,
            });
          }
          const cur = map.get(key);
          cur.hadir += row.hadir || 0;
          cur.terlambat += row.terlambat || 0;
          cur.izin += row.izin || 0;
          cur.sakit += row.sakit || 0;
          cur.alfa += row.alfa || 0;
        });
        return Array.from(map.values());
      };

      if (period === 'harian') {
        const res = await adminAPI.rekap({ tanggal: range.tanggal });
        const arr = res?.data?.responseData?.rekap || [];
        setRekap(Array.isArray(arr) ? arr : []);
      } else {
        // Buat daftar tanggal dari start ke end
        const start = new Date(range.start);
        const end = new Date(range.end);
        const days = [];
        const d = new Date(start);
        while (d <= end) {
          days.push(formatDateInput(d));
          d.setDate(d.getDate() + 1);
        }
        const results = await Promise.all(
          days.map((tgl) =>
            adminAPI.rekap({ tanggal: tgl })
              .then((r) => r?.data?.responseData?.rekap || [])
              .catch(() => [])
          )
        );
        setRekap(aggregate(results));
      }
    } catch (e) {
      setError("Gagal memuat rekap. Periksa koneksi atau API backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKelas(); }, []);
  useEffect(() => { fetchRekap(); }, [range]);

  const rekapDisplay = useMemo(() => {
    if (!kelasFilter) return rekap;
    return rekap.filter((r) => {
      const name = r.kelas_nama || r.kelas || "";
      return name === kelasFilter;
    });
  }, [rekap, kelasFilter]);

  const exportCSV = () => {
    const headers = ["Kelas", "Hadir", "Terlambat", "Izin", "Sakit", "Alfa"];
    const rows = rekapDisplay.map((r) => [
      r.kelas_nama || r.kelas || "-",
      r.hadir || 0,
      r.terlambat || 0,
      r.izin || 0,
      r.sakit || 0,
      r.alfa || 0,
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap_${period}_${range.tanggal || `${range.start}_${range.end}`}${kelasFilter ? `_${kelasFilter.replace(/\s+/g, '-')}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    window.print();
  };

  if (loading && rekap.length === 0) return <Loading text="Memuat rekap..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header title="Rekap Absensi" subtitle="SMK Trimulia" /> */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPeriod("harian")}
                className={`px-3 py-1.5 rounded-md text-sm ${period === "harian" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >Harian</button>
              <button
                onClick={() => setPeriod("mingguan")}
                className={`px-3 py-1.5 rounded-md text-sm ${period === "mingguan" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >Mingguan</button>
              <button
                onClick={() => setPeriod("bulanan")}
                className={`px-3 py-1.5 rounded-md text-sm ${period === "bulanan" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >Bulanan</button>
            </div>

            <input
              type="date"
              value={formatDateInput(baseDate)}
              onChange={(e) => setBaseDate(new Date(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            />

            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Semua Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.label}>{k.label}</option>
              ))}
            </select>

            <div className="ml-auto flex gap-2">
              <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Export Excel</button>
              <button onClick={printPDF} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Export PDF</button>
            </div>
          </div>
          {period !== "harian" && (
            <p className="mt-2 text-xs text-gray-500">
              Rentang: {range.start} — {range.end}
            </p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead className="table-thead">
                <tr>
                  <th className="table-th">Kelas</th>
                  <th className="table-th">Hadir</th>
                  <th className="table-th">Terlambat</th>
                  <th className="table-th">Izin</th>
                  <th className="table-th">Sakit</th>
                  <th className="table-th">Alfa</th>
                </tr>
              </thead>
              <tbody className="table-tbody">
                {rekapDisplay.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">Tidak ada data rekap.</td>
                  </tr>
                ) : (
                  rekapDisplay.map((row, idx) => (
                    <tr key={idx} className="table-tr hover:bg-gray-50">
                      <td className="table-td">{row.kelas_nama || row.kelas || '-'}</td>
                      <td className="table-td">{row.hadir || 0}</td>
                      <td className="table-td">{row.terlambat || 0}</td>
                      <td className="table-td">{row.izin || 0}</td>
                      <td className="table-td">{row.sakit || 0}</td>
                      <td className="table-td">{row.alfa || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
