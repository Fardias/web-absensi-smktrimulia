import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { guruAPI } from "../../services/api";
import { FileDown, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import DataTable from "../../components/DataTable";

const formatDateInput = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDateDisplay = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};

export default function RekapWalas() {
  const { user } = useAuth();
  const [tanggal, setTanggal] = useState(() => new Date());
  const [tanggalAkhir, setTanggalAkhir] = useState(() => new Date());
  const [filterPreset, setFilterPreset] = useState('1hari');
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

  const handleFilterPreset = (preset) => {
    setFilterPreset(preset);
    const today = new Date();
    const end = new Date();
    
    switch(preset) {
      case '1hari':
        setTanggal(today);
        setTanggalAkhir(today);
        break;
      case '1minggu':
        end.setDate(today.getDate() + 6);
        setTanggal(today);
        setTanggalAkhir(end);
        break;
      case '1bulan':
        end.setMonth(today.getMonth() + 1);
        setTanggal(today);
        setTanggalAkhir(end);
        break;
      case '1tahun':
        end.setFullYear(today.getFullYear() + 1);
        setTanggal(today);
        setTanggalAkhir(end);
        break;
      default:
        setTanggal(today);
        setTanggalAkhir(today);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await guruAPI.lihatAbsensiSiswa({ 
        tanggal: formatDateInput(tanggal),
        tanggal_akhir: formatDateInput(tanggalAkhir)
      });
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
  useEffect(() => { fetchList(); }, [tanggal, tanggalAkhir]);

  // Define columns for DataTable
  const columns = [
    {
      key: 'nis',
      label: 'NIS',
      sortable: true,
      accessor: (row) => row.nis || '-'
    },
    {
      key: 'nama',
      label: 'Nama',
      sortable: true,
      accessor: (row) => row.nama || '-'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span className="capitalize">{row.status || '-'}</span>
      )
    },
    {
      key: 'jam_datang',
      label: 'Jam Datang',
      sortable: true,
      accessor: (row) => row.jam_datang || '-'
    },
    {
      key: 'jam_pulang',
      label: 'Jam Pulang',
      sortable: true,
      accessor: (row) => row.jam_pulang || '-'
    }
  ];

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text("Rekap Absensi Kelas Wali", 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Kelas: ${walasInfo?.kelas_label || '-'}`, 14, 22);
    doc.text(`Periode: ${formatDateDisplay(tanggal)} s.d. ${formatDateDisplay(tanggalAkhir)}`, 14, 28);
    
    // Summary
    doc.text(`Hadir: ${counts.hadir} | Terlambat: ${counts.terlambat} | Izin: ${counts.izin} | Sakit: ${counts.sakit} | Alfa: ${counts.alfa}`, 14, 34);
    
    // Table
    const tableData = list.map((row) => [
      row.nis || '-',
      row.nama || '-',
      (row.status || '-').charAt(0).toUpperCase() + (row.status || '-').slice(1),
      row.jam_datang || '-',
      row.jam_pulang || '-'
    ]);
    
    autoTable(doc, {
      startY: 40,
      head: [['NIS', 'Nama', 'Status', 'Jam Datang', 'Jam Pulang']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 102] },
      styles: { fontSize: 9 }
    });
    
    doc.save(`Rekap-Absensi-${formatDateDisplay(tanggal)}-${formatDateDisplay(tanggalAkhir)}.pdf`);
  };

  const exportToExcel = () => {
    const worksheetData = [
      ['Rekap Absensi Kelas Wali'],
      [`Kelas: ${walasInfo?.kelas_label || '-'}`],
      [`Periode: ${formatDateDisplay(tanggal)} s.d. ${formatDateDisplay(tanggalAkhir)}`],
      [`Hadir: ${counts.hadir} | Terlambat: ${counts.terlambat} | Izin: ${counts.izin} | Sakit: ${counts.sakit} | Alfa: ${counts.alfa}`],
      [],
      ['NIS', 'Nama', 'Status', 'Jam Datang', 'Jam Pulang'],
      ...list.map((row) => [
        row.nis || '-',
        row.nama || '-',
        (row.status || '-').charAt(0).toUpperCase() + (row.status || '-').slice(1),
        row.jam_datang || '-',
        row.jam_pulang || '-'
      ])
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi');
    
    XLSX.writeFile(workbook, `Rekap-Absensi-${formatDateDisplay(tanggal)}-${formatDateDisplay(tanggalAkhir)}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Rekap Absensi Kelas Wali</h2>
              <p className="text-xs sm:text-sm text-gray-600">{walasInfo?.kelas_label || 'Memuat info kelas...'}</p>
            </div>
          </div>
          
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 mb-4 min-w-max">
              <button
                onClick={() => handleFilterPreset('1hari')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filterPreset === '1hari' 
                    ? 'bg-[#003366] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                1 Hari
              </button>
              <button
                onClick={() => handleFilterPreset('1minggu')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filterPreset === '1minggu' 
                    ? 'bg-[#003366] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                1 Minggu
              </button>
              <button
                onClick={() => handleFilterPreset('1bulan')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filterPreset === '1bulan' 
                    ? 'bg-[#003366] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                1 Bulan
              </button>
              <button
                onClick={() => handleFilterPreset('1tahun')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filterPreset === '1tahun' 
                    ? 'bg-[#003366] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                1 Tahun
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Dari:</label>
              <input
                type="date"
                value={formatDateInput(tanggal)}
                onChange={(e) => {
                  setTanggal(new Date(e.target.value));
                  setFilterPreset('');
                }}
                className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sampai:</label>
              <input
                type="date"
                value={formatDateInput(tanggalAkhir)}
                onChange={(e) => {
                  setTanggalAkhir(new Date(e.target.value));
                  setFilterPreset('');
                }}
                className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="mt-3 text-xs sm:text-sm text-gray-600">
            Rekap absensi dari tanggal <span className="font-semibold">{formatDateDisplay(tanggal)}</span> s.d. <span className="font-semibold">{formatDateDisplay(tanggalAkhir)}</span>
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

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={exportToPDF}
            disabled={list.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <FileDown size={18} />
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            disabled={list.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4">
          {loading ? (
            <p className="p-4 text-sm text-gray-500">Memuat data rekap...</p>
          ) : error ? (
            <p className="p-4 text-sm text-red-600">{error}</p>
          ) : (
            <DataTable
              data={list}
              columns={columns}
              searchFields={['nis', 'nama', 'status']}
              defaultSort={{ field: 'nama', direction: 'asc' }}
              defaultItemsPerPage={10}
              searchPlaceholder="Cari NIS, nama, atau status..."
              emptyMessage="Tidak ada data absensi untuk periode ini."
            />
          )}
        </div>
      </main>
    </div>
  );
}