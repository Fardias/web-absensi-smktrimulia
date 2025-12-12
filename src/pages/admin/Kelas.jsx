import React, { useEffect, useState } from 'react'
import { adminAPI } from "../../services/api";
import { Loading } from "../../components";
import Swal from "sweetalert2";

const Kelas = () => {
  const [list, setList] = useState([]);
  const [jurusan, setJurusan] = useState([]);
  const [walas, setWalas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [tingkat, setTingkat] = useState('X');
  const [paralel, setParalel] = useState('');
  const [jurusanId, setJurusanId] = useState('');
  const [walasId, setWalasId] = useState('');

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [klsRes, jurRes, walRes] = await Promise.all([
        adminAPI.getKelas(),
        adminAPI.getJurusan(),
        adminAPI.getWalas(),
      ]);
      const kelasArr = klsRes?.data?.kelas ?? [];
      setList(Array.isArray(kelasArr) ? kelasArr : []);
      setJurusan(jurRes?.data?.jurusan ?? []);
      setWalas(walRes?.data?.walas ?? []);
    } catch (e) {
      setError("Gagal memuat data kelas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!jurusanId && jurusan.length > 0) {
      setJurusanId(String(jurusan[0].jurusan_id));
    }
  }, [jurusan]);

  useEffect(() => {
    if (!walasId && walas.length > 0) {
      setWalasId(String(walas[0].walas_id));
    }
  }, [walas]);

  function openAdd() {
    setEditing(null);
    setTingkat('X');
    setParalel('');
    setJurusanId(jurusan[0]?.jurusan_id ? String(jurusan[0].jurusan_id) : '');
    setWalasId(walas[0]?.walas_id ? String(walas[0].walas_id) : '');
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setTingkat(item?.tingkat || 'X');
    setParalel(item?.paralel || '');
    setJurusanId(String(item?.jurusan_id || item?.jurusan?.jurusan_id || ''));
    setWalasId(String(item?.walas_id || item?.walas?.walas_id || ''));
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!/^[a-zA-Z0-9\s]+$/.test(paralel)) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Paralel hanya boleh huruf atau angka" });
      return;
    }
    const jid = parseInt(jurusanId, 10);
    const wid = parseInt(walasId, 10);
    if (!Number.isInteger(jid) || !jurusan.some((j) => j.jurusan_id === jid)) {
      const msg = "Jurusan wajib dipilih";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
      return;
    }
    if (!Number.isInteger(wid) || !walas.some((w) => w.walas_id === wid)) {
      const msg = "Wali kelas wajib dipilih";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
      return;
    }
    const payload = {
      tingkat,
      paralel: paralel ? paralel.trim().toUpperCase() : null,
      jurusan_id: jid,
      walas_id: wid,
    };
    try {
      setLoading(true);
      if (editing) {
        const res = await adminAPI.updateKelas(editing.kelas_id, payload);
        const updated = res?.data?.kelas;
        setList((prev) => prev.map((x) => (x.kelas_id === editing.kelas_id ? updated : x)));
        Swal.fire({ icon: "success", title: "Berhasil", text: "Kelas berhasil diperbarui" });
      } else {
        const res = await adminAPI.createKelas(payload);
        const created = res?.data?.kelas;
        setList((prev) => [created, ...prev]);
        Swal.fire({ icon: "success", title: "Berhasil", text: "Kelas berhasil ditambahkan" });
      }
      closeModal();
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal menyimpan kelas";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    const result = await Swal.fire({
      title: 'Hapus kelas',
      text: `Hapus kelas ${item.tingkat} ${item.jurusan?.nama_jurusan ?? ''} ${item.paralel || ''}?`,
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
      await adminAPI.deleteKelas(item.kelas_id);
      setList((prev) => prev.filter((x) => x.kelas_id !== item.kelas_id));
      Swal.fire({ icon: "success", title: "Berhasil", text: "Kelas berhasil dihapus" });
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal menghapus kelas";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  if (loading && !showModal) {
    return <Loading text="Memuat data kelas..." />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Kelas</h1>
        <button onClick={openAdd} className="bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244]">Tambah Kelas</button>
      </div>

      {error && (
        <div className="mb-3 text-red-600 font-semibold">{error}</div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">No</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Kelas</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Wali Kelas</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((k, idx) => (
              <tr key={k.kelas_id}>
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{k.tingkat} {k.jurusan?.nama_jurusan} {k.paralel}</td>
                <td className="px-4 py-2">{k.walas?.nama || '-'}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => openEdit(k)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                  <button onClick={() => handleDelete(k)} className="px-3 py-1 bg-red-600 text-white rounded">Hapus</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">Belum ada kelas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Kelas' : 'Tambah Kelas'}</h2>
            <form onSubmit={submitForm}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat</label>
                  <select value={tingkat} onChange={(e) => setTingkat(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="X">X</option>
                    <option value="XI">XI</option>
                    <option value="XII">XII</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paralel</label>
                  <input type="text" maxLength={1} value={paralel} onChange={(e) => setParalel(e.target.value.toUpperCase())} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
                  <select value={jurusanId} onChange={(e) => setJurusanId(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                    {jurusan.map((j) => (
                      <option key={j.jurusan_id} value={j.jurusan_id}>{j.nama_jurusan}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wali Kelas</label>
                  <select value={walasId} onChange={(e) => setWalasId(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                    {walas.map((w) => (
                      <option key={w.walas_id} value={w.walas_id}>{w.nama} ({w.nip})</option>
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

export default Kelas
