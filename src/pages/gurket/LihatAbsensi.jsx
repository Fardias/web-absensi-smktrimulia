import React, { useEffect, useMemo, useState } from "react";
import { guruAPI, utilityAPI } from "../../services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const STATUS = {
  HADIR: "hadir",
  TERLAMBAT: "terlambat",
  IZIN: "izin",
  SAKIT: "sakit",
  ALFA: "alfa",
};

const statusMeta = {
  [STATUS.HADIR]: {
    label: "Hadir",
    color: "text-green-600 bg-green-100",
    dot: "bg-green-500",
  },
  [STATUS.TERLAMBAT]: {
    label: "Terlambat",
    color: "text-yellow-600 bg-yellow-100",
    dot: "bg-yellow-500",
  },
  [STATUS.IZIN]: {
    label: "Izin",
    color: "text-blue-600 bg-blue-100",
    dot: "bg-blue-500",
  },
  [STATUS.SAKIT]: {
    label: "Sakit",
    color: "text-purple-600 bg-purple-100",
    dot: "bg-purple-500",
  },
  [STATUS.ALFA]: {
    label: "Alfa",
    color: "text-red-600 bg-red-100",
    dot: "bg-red-500",
  },
};

export default function LihatAbsensi() {
  const [kelasList, setKelasList] = useState([]);
  const [kelas, setKelas] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [error, setError] = useState(null);

  async function fetchKelas() {
    try {
      const res = await utilityAPI.listKelas();
      const data = res?.data?.responseData ?? [];
      const list = data.map((k) => ({
        id: k.kelas_id,
        label: `${k.tingkat}-${k.jurusan}-${k.paralel}`,
      }));
      setKelasList(list);
      if (list.length > 0 && !kelas) setKelas(list[0].id);
    } catch (err) {
      console.error("Gagal ambil kelas:", err);
      setError("Gagal memuat daftar kelas.");
    }
  }

  async function fetchAttendance() {
    if (!kelas) return;
    setLoading(true);
    setError(null);
    try {
      const res = await guruAPI.lihatAbsensiSiswa({ kelas_id: kelas, tanggal });
      const data = res?.data?.responseData?.absensi ?? [];

      const formatted = data.map((item, i) => ({
        id: item.absensi_id || i,
        nis: item.nis,
        name: item.nama,
        status: item.status || item.jenis_absen,
        time: item.jam_datang || "-",
        note: "",
      }));

      setAttendance(formatted);
    } catch (err) {
      console.error("Gagal ambil absensi:", err);
      setError("Gagal memuat data absensi. Periksa koneksi atau konfigurasi API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKelas();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [kelas, tanggal]);

  const counts = useMemo(() => {
    const c = {
      [STATUS.HADIR]: 0,
      [STATUS.TERLAMBAT]: 0,
      [STATUS.IZIN]: 0,
      [STATUS.SAKIT]: 0,
      [STATUS.ALFA]: 0,
    };
    attendance.forEach((s) => (c[s.status] = (c[s.status] || 0) + 1));
    return c;
  }, [attendance]);

  const filtered = attendance.filter((s) => {
    const q = search.trim().toLowerCase();
    if (filterStatus && s.status !== filterStatus) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      (s.note || "").toLowerCase().includes(q)
    );
  });

  function toggleFilter(st) {
    setFilterStatus((prev) => (prev === st ? null : st));
  }

  // ✅ EXPORT EXCEL
  function exportExcel() {
    const sheetData = [
      ["NIS", "Nama", "Status", "Waktu", "Catatan"],
      ...attendance.map((r) => [
        r.nis,
        r.name,
        statusMeta[r.status]?.label || r.status,
        r.time,
        r.note || "",
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absensi");
    XLSX.writeFile(wb, `absensi_${kelas}_${tanggal}.xlsx`);
  }

  // ✅ EXPORT PDF
  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Laporan Absensi Siswa", 14, 15);
    doc.setFontSize(11);
    doc.text(
      `Kelas: ${kelasList.find((k) => k.id === Number(kelas))?.label || "-"} | Tanggal: ${tanggal}`,
      14,
      23
    );

    const tableData = attendance.map((r) => [
      r.nis,
      r.name,
      statusMeta[r.status]?.label || r.status,
      r.time,
      r.note || "",
    ]);

    doc.autoTable({
      head: [["NIS", "Nama", "Status", "Waktu", "Catatan"]],
      body: tableData,
      startY: 30,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 },
    });

    doc.save(`absensi_${kelas}_${tanggal}.pdf`);
  }

  return (
    <div className="flex flex-col p-6 md:p-8">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">Lihat Absensi</h2>
      <p className="mb-6 text-gray-600 text-sm">
        Daftar siswa per kelas & per hari — pilih kelas dan tanggal untuk
        melihat rekap.
      </p>

      {/* Filter Section */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Kelas</label>
          <select
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
          >
            <option value="">Pilih kelas</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
          />
        </div>

        <button
          onClick={fetchAttendance}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Muat ulang
        </button>

        <div className="ml-auto flex gap-2">
          <button
            onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Export Excel
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(statusMeta).map((st) => (
          <button
            key={st}
            onClick={() => toggleFilter(st)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition
              ${
                filterStatus === st
                  ? `border-blue-500 bg-blue-50`
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${statusMeta[st].dot}`}
            />
            <span className="font-semibold">{statusMeta[st].label}</span>
            <span className="text-gray-500 text-xs">({counts[st] || 0})</span>
          </button>
        ))}

        <input
          placeholder="Cari nama atau NIS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200"
        />
      </div>

      {/* Table Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 text-sm">
          <div>
            Rekap:{" "}
            <span className="font-semibold">
              {kelasList.find((k) => k.id === Number(kelas))?.label || "-"}
            </span>{" "}
            — <span className="font-semibold">{tanggal}</span>
          </div>
          <div className="text-gray-600">
            Total siswa: <strong>{attendance.length}</strong>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Memuat data...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : attendance.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Belum ada data absensi.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Tidak ada hasil untuk filter saat ini.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 text-left">
              <tr>
                <th className="p-3 border-b w-12">No</th>
                <th className="p-3 border-b w-32">NIS</th>
                <th className="p-3 border-b">Nama</th>
                <th className="p-3 border-b w-32">Status</th>
                <th className="p-3 border-b w-32">Waktu</th>
                <th className="p-3 border-b">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50 border-b last:border-none transition"
                >
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{s.nis}</td>
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full font-medium ${
                        statusMeta[s.status]?.color
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          statusMeta[s.status]?.dot
                        }`}
                      />
                      {statusMeta[s.status]?.label || s.status}
                    </span>
                  </td>
                  <td className="p-3">{s.time}</td>
                  <td className="p-3">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
