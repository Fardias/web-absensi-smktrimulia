import React, { useEffect, useState } from 'react'
import { adminAPI } from "../../services/api";
import { Loading } from "../../components";
import Swal from "sweetalert2";

const Jurusan = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nama, setNama] = useState("");

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getJurusan();
      const arr = res?.data?.jurusan ?? [];
      setList(Array.isArray(arr) ? arr : []);
    } catch (e) {
      setError("Gagal memuat data jurusan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openAdd() {
    setEditing(null);
    setNama("");
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setNama(item?.nama_jurusan || "");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setNama("");
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!nama.trim()) return;
    try {
      setLoading(true);
      if (editing) {
        const res = await adminAPI.updateJurusan(editing.jurusan_id, { nama_jurusan: nama.trim() });
        const updated = res?.data?.jurusan;
        setList((prev) => prev.map((x) => (x.jurusan_id === editing.jurusan_id ? updated : x)));
        Swal.fire({ icon: "success", title: "Berhasil", text: "Jurusan berhasil diperbarui" });
      } else {
        const res = await adminAPI.createJurusan({ nama_jurusan: nama.trim() });
        const created = res?.data?.jurusan;
        setList((prev) => [created, ...prev]);
        Swal.fire({ icon: "success", title: "Berhasil", text: "Jurusan berhasil ditambahkan" });
      }
      closeModal();
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal menyimpan jurusan";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Hapus jurusan "${item.nama_jurusan}"?`)) return;
    try {
      setLoading(true);
      await adminAPI.deleteJurusan(item.jurusan_id);
      setList((prev) => prev.filter((x) => x.jurusan_id !== item.jurusan_id));
      Swal.fire({ icon: "success", title: "Berhasil", text: "Jurusan berhasil dihapus" });
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal menghapus jurusan";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  if (loading && !showModal) {
    return <Loading text="Memuat data jurusan..." />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Jurusan</h1>
        <button onClick={openAdd} className="bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244]">Add Jurusan</button>
      </div>

      {error && (
        <div className="mb-3 text-red-600 font-semibold">{error}</div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">No</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Nama Jurusan</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((j, idx) => (
              <tr key={j.jurusan_id}>
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{j.nama_jurusan}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => openEdit(j)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                  <button onClick={() => handleDelete(j)} className="px-3 py-1 bg-red-600 text-white rounded">Hapus</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">Belum ada jurusan</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Jurusan' : 'Tambah Jurusan'}</h2>
            <form onSubmit={submitForm}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jurusan</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Contoh: TKJ"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded border border-gray-300">Batal</button>
                <button type="submit" className="px-4 py-2 rounded bg-[#003366] text-white">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Jurusan