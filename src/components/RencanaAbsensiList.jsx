import React, { useMemo, useState } from "react";
import { guruAPI } from "../services/api";

const RencanaAbsensiList = ({ data, onUpdated }) => {
  // Group data by tanggal
  const grouped = data.reduce((acc, curr) => {
    if (!acc[curr.tanggal]) acc[curr.tanggal] = [];
    acc[curr.tanggal].push(curr);
    return acc;
  }, {});

  if (Object.keys(grouped).length === 0) {
    return (
      <p className="text-gray-600 text-center py-10 bg-gray-50 rounded-lg">
        Belum ada data rencana absensi.
      </p>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "normal":
        return "text-green-600";
      case "libur":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const sortedGroups = useMemo(() => {
    return Object.entries(grouped)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [grouped]);

  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  })();

  const upcomingGroups = useMemo(() => {
    return sortedGroups.filter(([tgl]) => String(tgl) >= todayStr);
  }, [sortedGroups, todayStr]);

  const pageSize = 7;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(upcomingGroups.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedGroups = upcomingGroups.slice(startIndex, startIndex + pageSize);

  const formatDateFull = (tanggal) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAjaran = (val) => {
    if (!val) return "";
    const s = String(val);
    if (/^\d{8}$/.test(s)) {
      return `${s.slice(0, 4)}/${s.slice(4, 8)}`;
    }
    if (/^\d{4}\/\d{4}$/.test(s)) {
      return s;
    }
    return s;
  };

  const summarize = (records) => {
    let normal = 0, libur = 0, lainnya = 0;
    for (const r of records) {
      if (r.status_hari === "normal") normal += 1;
      else if (r.status_hari === "libur") libur += 1;
      else lainnya += 1;
    }
    return { normal, libur, lainnya, total: records.length };
  };

  const [editingDate, setEditingDate] = useState(null);
  const [editStatus, setEditStatus] = useState("normal");
  const [editNote, setEditNote] = useState("");

  return (
    <div className="space-y-6">
      {paginatedGroups.map(([tanggal, records]) => (
        <div
          key={tanggal}
          className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-700">
              {/* tambah */}
              {formatDateFull(tanggal)} <span className="ml-2 text-sm text-gray-600">Tahun ajaran: {formatAjaran(records[0]?.thn_ajaran)}</span>
            </h2>

            <button
              className="ml-3 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => {
                setEditingDate(tanggal);
                const s = summarize(records);
                const defaultStatus = s.libur === s.total ? 'libur' : (s.normal === s.total ? 'normal' : '');
                setEditStatus(defaultStatus);
                setEditNote('');
              }}
            >
              Edit Status Hari
            </button>
          </div>

          {false}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {records.map((r, idx) => (
              <div
                key={`${r.tanggal}-${r.kelas.kelas_id}-${idx}`}
                className="rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 ">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800">
                    {r.kelas.tingkat} {r.kelas.jurusan.nama_jurusan}{r.kelas.paralel !== null ? `-${r.kelas.paralel}` : ''}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${r.status_hari === "normal" ? "bg-green-100 text-green-700" :
                    r.status_hari === "libur" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {r.status_hari}
                  </span>
                </div>
                {r.keterangan && (
                  <p className="text-sm text-gray-600 mt-2">
                    {r.keterangan}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-center mt-6 space-x-4"
      >
        <button
          className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          Sebelumnya
        </button>
        <span className="text-sm text-gray-600">
          {currentPage} / {totalPages}
        </span>
        <button
          className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        >
          Selanjutnya
        </button>
      </div>
      {editingDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Status Hari</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal</label>
                <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                  {formatDateFull(editingDate)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status Hari</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="normal">Normal</option>
                  <option value="libur">Libur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keterangan (opsional)</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Keterangan (opsional)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
                  onClick={() => setEditingDate(null)}
                >
                  Batal
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  onClick={async () => {
                    try {
                      const res = await guruAPI.updateRencanaStatusHari({ tanggal: editingDate, status_hari: editStatus, keterangan: editNote });
                      if (res.data?.responseStatus) {
                        if (onUpdated) await onUpdated();
                        setEditingDate(null);
                      } else {
                        alert(res.data?.responseMessage || 'Gagal memperbarui status hari');
                      }
                    } catch {
                      alert('Terjadi kesalahan saat memperbarui status hari');
                    }
                  }}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RencanaAbsensiList;
