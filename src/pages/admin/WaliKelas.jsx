import React, { useEffect, useState } from 'react'
import { adminAPI } from "../../services/api";
import { Loading } from "../../components";
import Swal from "sweetalert2";

const WaliKelas = () => {
  const [list, setList] = useState([]);
  const [akunList, setAkunList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [akunId, setAkunId] = useState('');

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const walasRes = await adminAPI.getWaliKelas();
      const wl = walasRes?.data?.walas ?? [];
      setList(Array.isArray(wl) ? wl : []);
      setAkunList([]);
    } catch (e) {
      setError("Gagal memuat data wali kelas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function openAdd() {
    setEditing(null);
    setNip('');
    setNama('');
    setAkunId('');
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setNip(item?.nip || '');
    setNama(item?.nama || '');
    setAkunId('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
  }

  async function submitForm(e) {
    e.preventDefault();
    const payload = {
      nip: nip.trim(),
      nama: nama.trim(),
    };
    try {
      setLoading(true);
      if (editing) {
        const res = await adminAPI.updateWaliKelas(editing.walas_id, payload);
        const updated = res?.data?.walas;
        setList((prev) => prev.map((x) => (x.walas_id === editing.walas_id ? updated : x)));
        Swal.fire({ icon: "success", title: "Berhasil", text: "Wali kelas berhasil diperbarui" });
      } else {
        const res = await adminAPI.createWaliKelas(payload);
        const created = res?.data?.walas;
        setList((prev) => [created, ...prev]);
        Swal.fire({ icon: "success", title: "Berhasil", text: "Wali kelas berhasil ditambahkan" });
      }
      closeModal();
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal menyimpan wali kelas";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Hapus wali kelas ${item.nama} (${item.nip})?`)) return;
    try {
      setLoading(true);
      await adminAPI.deleteWaliKelas(item.walas_id);
      setList((prev) => prev.filter((x) => x.walas_id !== item.walas_id));
      Swal.fire({ icon: "success", title: "Berhasil", text: "Wali kelas berhasil dihapus" });
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal menghapus wali kelas";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  if (loading && !showModal) {
    return <Loading text="Memuat data wali kelas..." />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Wali Kelas</h1>
        <button onClick={openAdd} className="bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244]">Add Wali Kelas</button>
      </div>

      {error && (
        <div className="mb-3 text-red-600 font-semibold">{error}</div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">No</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">NIP/Username</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Nama</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((w, idx) => (
              <tr key={w.walas_id}>
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{w.nip}</td>
                <td className="px-4 py-2">{w.nama}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => openEdit(w)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                  <button onClick={() => handleDelete(w)} className="px-3 py-1 bg-red-600 text-white rounded">Hapus</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Belum ada wali kelas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Wali Kelas' : 'Tambah Wali Kelas'}</h2>
            <form onSubmit={submitForm}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                  <input type="text" value={nip} onChange={(e)=>setNip(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="NIP" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input type="text" value={nama} onChange={(e)=>setNama(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" required placeholder="Nama Wali Kelas" />
                </div>
                {/* Akun dibuat otomatis dari NIP saat tambah */}
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

export default WaliKelas