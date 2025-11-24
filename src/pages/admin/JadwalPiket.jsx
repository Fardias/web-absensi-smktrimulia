import React, { useEffect, useState } from 'react'
import { adminAPI } from "../../services/api";
import { Loading } from "../../components";
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
  const hariNama = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  function parseDateYmd(ymd) {
    const [y,m,d] = (ymd || '').split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }
  function getHari(ymd) {
    const dt = parseDateYmd(ymd);
    return hariNama[dt.getDay()] || '-';
  }
  function formatTanggal(ymd) {
    const [y,m,d] = (ymd || '').split('-');
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
      const arr = jadRes?.data?.jadwal ?? [];
      setList(Array.isArray(arr) ? arr : []);
      setGurketList(gurketRes?.data?.gurket ?? []);
    } catch (e) {
      setError("Gagal memuat data jadwal piket");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const today = new Date();
    const iso = today.toISOString().slice(0,10);
    setTanggal(iso);
    fetchAll();
  }, []);

  function openAdd() {
    setEditing(null);
    const today = new Date();
    const iso = today.toISOString().slice(0,10);
    setTanggal(iso);
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
    const todayOnly = new Date();
    todayOnly.setHours(0,0,0,0);
    const selectedOnly = parseDateYmd(tanggal);
    selectedOnly.setHours(0,0,0,0);
    if (selectedOnly < todayOnly) {
      setError("Tanggal tidak boleh sebelum hari ini");
      return;
    }
    if (!editing && list.some((x) => x.tanggal === tanggal)) {
      setError("Tanggal tersebut sudah memiliki guru piket");
      return;
    }
    const payload = {
      tanggal,
      gurket_id: Number(gurketId),
    };
    try {
      setLoading(true);
      if (editing) {
        const res = await adminAPI.updateJadwalPiket(editing.jad_piket_id, payload);
        const updated = res?.data?.jadwal;
        setList((prev) => prev.map((x) => (x.jad_piket_id === editing.jad_piket_id ? updated : x)));
        Swal.fire({ icon: "success", title: "Berhasil", text: "Jadwal piket berhasil diperbarui" });
      } else {
        const res = await adminAPI.createJadwalPiket(payload);
        const created = res?.data?.jadwal;
        setList((prev) => [created, ...prev]);
        Swal.fire({ icon: "success", title: "Berhasil", text: "Jadwal piket berhasil ditambahkan" });
      }
      closeModal();
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal menyimpan jadwal piket";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Hapus jadwal ${item.guru_piket?.nama || '-'} pada ${formatTanggal(item.tanggal)} (${getHari(item.tanggal)})?`)) return;
    try {
      setLoading(true);
      await adminAPI.deleteJadwalPiket(item.jad_piket_id);
      setList((prev) => prev.filter((x) => x.jad_piket_id !== item.jad_piket_id));
      Swal.fire({ icon: "success", title: "Berhasil", text: "Jadwal piket berhasil dihapus" });
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal menghapus jadwal piket";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  if (loading && !showModal) {
    return <Loading text="Memuat data jadwal piket..." />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Jadwal Piket</h1>
        <button onClick={openAdd} className="bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244]">Add Jadwal</button>
      </div>

      {error && (
        <div className="mb-3 text-red-600 font-semibold">{error}</div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">No</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Hari</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Tanggal</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Guru Piket</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((w, idx) => (
              <tr key={w.jad_piket_id}>
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{getHari(w.tanggal)}</td>
                <td className="px-4 py-2">{formatTanggal(w.tanggal)}</td>
                <td className="px-4 py-2">{w.guru_piket?.nama || '-'}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => openEdit(w)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                  <button onClick={() => handleDelete(w)} className="px-3 py-1 bg-red-600 text-white rounded">Hapus</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">Belum ada jadwal piket</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Jadwal Piket' : 'Tambah Jadwal Piket'}</h2>
            <form onSubmit={submitForm}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input type="date" value={tanggal} min={new Date().toISOString().slice(0,10)} onChange={(e)=>setTanggal(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guru Piket</label>
                  <select value={gurketId} onChange={(e)=>setGurketId(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                    {gurketList.map((a)=> (
                      <option key={a.gurket_id} value={a.gurket_id}>{a.nama} — {a.nip}</option>
                    ))}
                  </select>
                </div>
              </div>
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