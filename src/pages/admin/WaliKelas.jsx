import { useEffect, useState } from 'react'
import { adminAPI } from "../../services/api";
import { Loading, DataTable } from "../../components";
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
      const wl = walasRes?.data?.responseData?.walas ?? [];
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
    if (!/^\d+$/.test(nip)) {
      Swal.fire({ icon: "error", title: "Gagal", text: "NIP hanya boleh mengandung angka" });
      return;
    }
    if ((!/^[a-zA-Z\s]+$/.test(nama))) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Nama tidak boleh mengandung angka dan simbol" });
      return;
    }
    const payload = {
      nip: nip.trim(),
      nama: nama.trim(),
    };
    try {
      setLoading(true);
      if (editing) {
        const res = await adminAPI.updateWaliKelas(editing.walas_id, payload);
        const updated = res?.data?.responseData?.walas;
        setList((prev) => prev.map((x) => (x.walas_id === editing.walas_id ? updated : x)));
        Swal.fire({ icon: "success", title: "Berhasil", text: "Wali kelas berhasil diperbarui" });
      } else {
        const res = await adminAPI.createWaliKelas(payload);
        const created = res?.data?.responseData?.walas;
        setList((prev) => [created, ...prev]);
        Swal.fire({ icon: "success", title: "Berhasil", text: "Wali kelas berhasil ditambahkan" });
      }
      closeModal();
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Gagal menyimpan wali kelas";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    const result = await Swal.fire({
      title: 'Hapus wali kelas',
      text: `Hapus wali kelas ${item.nama} (${item.nip})?`,
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
      await adminAPI.deleteWaliKelas(item.walas_id);
      setList((prev) => prev.filter((x) => x.walas_id !== item.walas_id));
      Swal.fire({ icon: "success", title: "Berhasil", text: "Wali kelas berhasil dihapus" });
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Gagal menghapus wali kelas";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  if (loading && !showModal) {
    return <Loading text="Memuat data wali kelas..." />;
  }

  // Define columns for DataTable
  const columns = [
    {
      key: 'no',
      label: 'No',
      render: (item, index) => index + 1
    },
    {
      key: 'nip',
      label: 'NIP/Username',
      sortable: true,
      accessor: (item) => item.nip
    },
    {
      key: 'nama',
      label: 'Nama',
      sortable: true,
      accessor: (item) => item.nama
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
          <button 
            onClick={() => handleDelete(item)} 
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Hapus
          </button>
        </div>
      )
    }
  ];

  // Define search fields
  const searchFields = ['nip', 'nama'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Wali Kelas</h1>
        <button onClick={openAdd} className="bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244]">Tambah Wali Kelas</button>
      </div>

      {error && (
        <div className="mb-3 text-red-600 font-semibold">{error}</div>
      )}

      <DataTable
        data={list}
        columns={columns}
        searchFields={searchFields}
        searchPlaceholder="Cari NIP atau nama wali kelas..."
        emptyMessage="Belum ada wali kelas"
        defaultSort={{ field: 'nama', direction: 'asc' }}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Wali Kelas' : 'Tambah Wali Kelas'}</h2>
            <form onSubmit={submitForm}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                  <input type="text" value={nip} onChange={(e) => setNip(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="NIP" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" required placeholder="Nama Wali Kelas" />
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
