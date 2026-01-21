import { useEffect, useState } from 'react'
import { adminAPI } from "../../services/api";
import { Loading, DataTable } from "../../components";
import Swal from "sweetalert2";

const GuruPiket = () => {
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
      const listRes = await adminAPI.getGuruPiket();
      const arr = listRes?.data?.responseData?.gurket ?? [];
      setList(Array.isArray(arr) ? arr : []);
      setAkunList([]);
    } catch (e) {
      setError("Gagal memuat data guru piket");
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
        const res = await adminAPI.updateGuruPiket(editing.gurket_id, payload);
        const updated = res?.data?.responseData?.gurket;
        setList((prev) => prev.map((x) => (x.gurket_id === editing.gurket_id ? updated : x)));
        Swal.fire({ icon: "success", title: "Berhasil", text: "Guru piket berhasil diperbarui" });
      } else {
        const res = await adminAPI.createGuruPiket(payload);
        const created = res?.data?.responseData?.gurket;
        setList((prev) => [created, ...prev]);
        Swal.fire({ icon: "success", title: "Berhasil", text: "Guru piket berhasil ditambahkan" });
      }
      closeModal();
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Gagal menyimpan guru piket";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    const result = await Swal.fire({
      title: 'Hapus guru piket',
      text: `Hapus guru piket ${item.nama} (${item.nip})?`,
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
      await adminAPI.deleteGuruPiket(item.gurket_id);
      setList((prev) => prev.filter((x) => x.gurket_id !== item.gurket_id));
      Swal.fire({ icon: "success", title: "Berhasil", text: "Guru piket berhasil dihapus" });
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Gagal menghapus guru piket";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  if (loading && !showModal) {
    return <Loading text="Memuat data guru piket..." />;
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
        <h1 className="text-2xl font-bold text-gray-900">Kelola Guru Piket</h1>
        <button onClick={openAdd} className="bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244]">Tambah Guru Piket</button>
      </div>

      {error && (
        <div className="mb-3 text-red-600 font-semibold">{error}</div>
      )}

      <DataTable
        data={list}
        columns={columns}
        searchFields={searchFields}
        searchPlaceholder="Cari NIP atau nama guru..."
        emptyMessage="Belum ada guru piket"
        defaultSort={{ field: 'nama', direction: 'asc' }}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Guru Piket' : 'Tambah Guru Piket'}</h2>
            <form onSubmit={submitForm}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIP/Username</label>
                  <input type="text" value={nip} onChange={(e)=>setNip(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="NIP"  required/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input type="text" value={nama} onChange={(e)=>setNama(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nama" required />
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

export default GuruPiket
