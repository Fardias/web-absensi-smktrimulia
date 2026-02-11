import { useEffect, useState } from 'react'
import { Trash } from "lucide-react";
import { adminAPI } from "../../services/api";
import { Loading, DataTable } from "../../components";
import Swal from "sweetalert2";

const JadwalPiket = () => {
  const [list, setList] = useState([]);
  const [gurketList, setGurketList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [tanggal, setTanggal] = useState('');
  const [gurketId, setGurketId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [assignments, setAssignments] = useState({ senin: '', selasa: '', rabu: '', kamis: '', jumat: '' });
  const hariNama = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  function parseDateYmd(ymd) {
    const [y, m, d] = (ymd || '').split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  function getHari(ymd) {
    const dt = parseDateYmd(ymd);
    return hariNama[dt.getDay()] || '-';
  }

  function formatTanggal(ymd) {
    const [y, m, d] = (ymd || '').split('-');
    if (!y || !m || !d) return ymd || '-';
    return `${d}-${m}-${y}`;
  }

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [jadRes, gurketRes] = await Promise.all([
        adminAPI.getJadwalPiket(),
        adminAPI.getGuruPiket(),
      ]);
      const arr = jadRes?.data?.responseData?.jadwal ?? [];
      
      // Filter data: hanya tampilkan dari tanggal hari ini ke depan
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const filteredArr = Array.isArray(arr) 
        ? arr.filter(item => {
            const itemDate = parseDateYmd(item.tanggal);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate >= today;
          })
        : [];
      
      setList(filteredArr);
      setGurketList(gurketRes?.data?.responseData?.gurket ?? []);
    } catch (e) {
      setError("Gagal memuat data jadwal piket");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    setTanggal(iso);
    fetchAll();
  }, []);

  function openAdd() {
    setEditing(null);
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    setTanggal(iso);
    setStartDate(iso);
    setAssignments({ senin: '', selasa: '', rabu: '', kamis: '', jumat: '' });
    setGurketId(gurketList[0]?.gurket_id ? String(gurketList[0].gurket_id) : '');
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setTanggal(item?.tanggal || '');
    setGurketId(String(item?.gurket_id || item?.guru_piket?.gurket_id || ''));
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
  }

  async function submitForm(e) {
    e.preventDefault();
    try {
      setLoading(true);
      if (editing) {
        const todayOnly = new Date();
        todayOnly.setHours(0, 0, 0, 0);
        const selectedOnly = parseDateYmd(tanggal);
        selectedOnly.setHours(0, 0, 0, 0);
        if (selectedOnly < todayOnly) {
          setError("Tanggal tidak boleh sebelum hari ini");
          setLoading(false);
          return;
        }
        if (!gurketId) {
          setError("Guru piket wajib dipilih");
          setLoading(false);
          return;
        }
        const payload = { tanggal, gurket_id: Number(gurketId) };
        const res = await adminAPI.updateJadwalPiket(editing.jad_piket_id, payload);
        const updated = res?.data?.responseData?.jadwal;
        setList((prev) => prev.map((x) => (x.jad_piket_id === editing.jad_piket_id ? updated : x)));
        Swal.fire({ icon: "success", title: "Berhasil", text: "Jadwal piket berhasil diperbarui" });
        closeModal();
      } else {
        // Bulk create logic
        const start = parseDateYmd(startDate);
        if (isNaN(start.getTime())) {
          setError("Tanggal mulai tidak valid");
          setLoading(false);
          return;
        }
        const anyMissing = [assignments.senin, assignments.selasa, assignments.rabu, assignments.kamis, assignments.jumat].some((v) => !v);
        if (anyMissing) {
          setError("Semua hari Senin s.d. Jumat wajib memiliki guru piket");
          setLoading(false);
          return;
        }

        // Prepare bulk data
        const bulkData = [];
        for (let i = 0; i < 365; i++) {
          const dt = new Date(start);
          dt.setDate(start.getDate() + i);
          const y = dt.getFullYear();
          const m = String(dt.getMonth() + 1).padStart(2, '0');
          const d = String(dt.getDate()).padStart(2, '0');
          const ymd = `${y}-${m}-${d}`;
          const dow = dt.getDay();
          
          // Skip weekend
          if (dow === 0 || dow === 6) continue;
          
          const mapId = {
            1: assignments.senin,
            2: assignments.selasa,
            3: assignments.rabu,
            4: assignments.kamis,
            5: assignments.jumat,
          }[dow];
          
          if (mapId) {
            bulkData.push({
              tanggal: ymd,
              gurket_id: Number(mapId)
            });
          }
        }

        // Send bulk request
        const res = await adminAPI.bulkCreateJadwalPiket({ jadwal: bulkData });
        const result = res?.data?.responseData;
        
        if (result) {
          // Refresh data setelah bulk create
          await fetchAll();
          Swal.fire({ 
            icon: "success", 
            title: "Berhasil", 
            text: `Jadwal dibuat: ${result.created}. Dilewati: ${result.skipped}.` 
          });
        }
        closeModal();
      }
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Gagal menyimpan jadwal piket";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    const result = await Swal.fire({
      title: 'Hapus jadwal piket',
      text: `Hapus jadwal ${item.guru_piket?.nama || '-'} pada ${formatTanggal(item.tanggal)} (${getHari(item.tanggal)})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal'
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      await adminAPI.deleteJadwalPiket(item.jad_piket_id);
      setList((prev) => prev.filter((x) => x.jad_piket_id !== item.jad_piket_id));
      Swal.fire({ icon: "success", title: "Berhasil", text: "Jadwal piket berhasil dihapus" });
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Gagal menghapus jadwal piket";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAll() {
    const result = await Swal.fire({
      title: 'Hapus Semua Jadwal Piket',
      html: `
        <div class="text-left">
          <p class="mb-2">Apakah Anda yakin ingin menghapus <strong>SEMUA JADWAL PIKET</strong>?</p>
          <p class="text-red-600 font-semibold mb-2">⚠️ PERINGATAN:</p>
          <ul class="text-sm text-gray-700 list-disc list-inside">
            <li>Semua jadwal piket akan dihapus permanen</li>
            <li>Semua data piket harian akan hilang</li>
            <li>Sistem akan kehilangan jadwal piket</li>
          </ul>
          <p class="mt-3 text-red-600 font-bold">Tindakan ini TIDAK DAPAT DIBATALKAN!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus Semua!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      focusCancel: true
    });

    if (result.isConfirmed) {
      // Konfirmasi kedua untuk keamanan ekstra
      const secondConfirm = await Swal.fire({
        title: 'Konfirmasi Terakhir',
        text: 'Ketik "HAPUS SEMUA" untuk melanjutkan',
        input: 'text',
        inputPlaceholder: 'Ketik: HAPUS SEMUA',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Hapus Semua Data',
        cancelButtonText: 'Batal',
        inputValidator: (value) => {
          if (value !== 'HAPUS SEMUA') {
            return 'Anda harus mengetik "HAPUS SEMUA" dengan benar!';
          }
        }
      });

      if (secondConfirm.isConfirmed) {
        try {
          const response = await adminAPI.deleteAllJadwalPiket();
          if (response.status === 200 && response.data.responseStatus) {
            setList([]);
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Semua jadwal piket berhasil dihapus'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: response.data.responseMessage || 'Gagal menghapus semua jadwal piket'
            });
          }
        } catch (error) {
          const msg = error?.response?.data?.responseMessage || 'Terjadi kesalahan saat menghapus semua jadwal piket';
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: msg
          });
        }
      }
    }
  }

  if (loading && !showModal) {
    return <Loading text="Memuat data jadwal piket..." />;
  }

  // Define columns for DataTable
  const columns = [
    {
      key: 'no',
      label: 'No',
      render: (item, index) => index + 1
    },
    {
      key: 'hari',
      label: 'Hari',
      sortable: true,
      accessor: (item) => getHari(item.tanggal),
      sortValue: (item) => getHari(item.tanggal)
    },
    {
      key: 'tanggal',
      label: 'Tanggal',
      sortable: true,
      accessor: (item) => formatTanggal(item.tanggal),
      sortValue: (item) => new Date(item.tanggal)
    },
    {
      key: 'guru_piket',
      label: 'Guru Piket',
      sortable: true,
      accessor: (item) => item.guru_piket?.nama || '-',
      sortValue: (item) => item.guru_piket?.nama || ''
    },
    {
      key: 'actions',
      label: 'Action',
      render: (item) => (
        <div className="space-x-2">
          <button
            onClick={() => openEdit(item)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          {/* ignore this button for temporary */}
          {/* <button 
            onClick={() => handleDelete(item)} 
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Hapus
          </button> */}
        </div>
      )
    }
  ];

  // Define search fields
  const searchFields = [
    (item) => item.guru_piket?.nama || '',
    (item) => getHari(item.tanggal),
    (item) => formatTanggal(item.tanggal)
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Jadwal Piket</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteAll}
            disabled={list.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash size={16} />
            Hapus Semua
          </button>
          <button onClick={openAdd} className="bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244]">Tambah Jadwal</button>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-red-600 font-semibold">{error}</div>
      )}

      <DataTable
        data={list}
        columns={columns}
        searchFields={searchFields}
        searchPlaceholder="Cari nama guru, hari, atau tanggal..."
        emptyMessage="Belum ada jadwal piket"
        defaultSort={{ field: 'tanggal', direction: 'desc' }}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Jadwal Piket' : 'Tambah Jadwal Piket'}</h2>
            <form onSubmit={submitForm}>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guru Piket</label>
                    <select value={gurketId} onChange={(e) => setGurketId(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                      {gurketList.map((a) => (
                        <option key={a.gurket_id} value={a.gurket_id}>{a.nama} — {a.username}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                    <input type="date" value={startDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Senin</label>
                      <select value={assignments.senin} onChange={(e) => setAssignments((p) => ({ ...p, senin: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="">Pilih Guru</option>
                        {gurketList.map((a) => (<option key={a.gurket_id} value={a.gurket_id}>{a.nama} — {a.username}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selasa</label>
                      <select value={assignments.selasa} onChange={(e) => setAssignments((p) => ({ ...p, selasa: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="">Pilih Guru</option>
                        {gurketList.map((a) => (<option key={a.gurket_id} value={a.gurket_id}>{a.nama} — {a.username}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rabu</label>
                      <select value={assignments.rabu} onChange={(e) => setAssignments((p) => ({ ...p, rabu: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="">Pilih Guru</option>
                        {gurketList.map((a) => (<option key={a.gurket_id} value={a.gurket_id}>{a.nama} — {a.username}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kamis</label>
                      <select value={assignments.kamis} onChange={(e) => setAssignments((p) => ({ ...p, kamis: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="">Pilih Guru</option>
                        {gurketList.map((a) => (<option key={a.gurket_id} value={a.gurket_id}>{a.nama} — {a.username}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumat</label>
                      <select value={assignments.jumat} onChange={(e) => setAssignments((p) => ({ ...p, jumat: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="">Pilih Guru</option>
                        {gurketList.map((a) => (<option key={a.gurket_id} value={a.gurket_id}>{a.nama} — {a.username}</option>))}
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Sistem akan membuat jadwal otomatis untuk 1 tahun ke depan (365 hari, hanya hari kerja Senin-Jumat).</p>
                </div>
              )}
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded border border-gray-300">Batal</button>
                <button type="submit" className="px-4 py-2 rounded bg-[#003366] text-white">{loading ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default JadwalPiket