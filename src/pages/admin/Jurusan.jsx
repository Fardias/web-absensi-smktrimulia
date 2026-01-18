import { useEffect, useState } from 'react'
import { adminAPI } from "../../services/api";
import { Loading, DataTable } from "../../components";
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
      const arr = res?.data?.responseData?.jurusan ?? [];
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
    if (!/^[a-zA-Z\s]+$/.test(nama)) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Nama jurusan hanya boleh berisi huruf dan spasi" });
      return;
    }
    if (!nama.trim() && !editing) return;
    try {
      setLoading(true);
      if (editing) {
        const res = await adminAPI.updateJurusan(editing.jurusan_id, { nama_jurusan: nama.trim() });
        const updated = res?.data?.responseData?.jurusan;
        setList((prev) => prev.map((x) => (x.jurusan_id === editing.jurusan_id ? updated : x)));
        Swal.fire({ icon: "success", title: "Berhasil", text: "Jurusan berhasil diperbarui" });
      } else {
        const res = await adminAPI.createJurusan({ nama_jurusan: nama.trim() });
        const created = res?.data?.responseData?.jurusan;
        setList((prev) => [created, ...prev]);
        Swal.fire({ icon: "success", title: "Berhasil", text: "Jurusan berhasil ditambahkan" });
      }
      closeModal();
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Gagal menyimpan jurusan";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    const result = await Swal.fire({
      title: 'Hapus jurusan',
      text: `Hapus jurusan "${item.nama_jurusan}"?`,
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
      await adminAPI.deleteJurusan(item.jurusan_id);
      setList((prev) => prev.filter((x) => x.jurusan_id !== item.jurusan_id));
      Swal.fire({ icon: "success", title: "Berhasil", text: "Jurusan berhasil dihapus" });
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Gagal menghapus jurusan";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  if (loading && !showModal) {
    return <Loading text="Memuat data jurusan..." />;
  }

  // Define columns for DataTable
  const columns = [
    {
      key: 'no',
      label: 'No',
      render: (item, index) => index + 1
    },
    {
      key: 'nama_jurusan',
      label: 'Nama Jurusan',
      sortable: true,
      accessor: (item) => item.nama_jurusan
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
  const searchFields = ['nama_jurusan'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Jurusan</h1>
        <button onClick={openAdd} className="bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244]">Tambah jurusan</button>
      </div>

      {error && (
        <div className="mb-3 text-red-600 font-semibold">{error}</div>
      )}

      <DataTable
        data={list}
        columns={columns}
        searchFields={searchFields}
        searchPlaceholder="Cari nama jurusan..."
        emptyMessage="Belum ada jurusan"
        defaultSort={{ field: 'nama_jurusan', direction: 'asc' }}
      />

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
                  placeholder="Contoh: Teknik Komputer dan Jaringan"
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
