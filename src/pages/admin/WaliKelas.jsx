import { useEffect, useState } from 'react'
import { Trash } from "lucide-react";
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

  const [username, setUsername] = useState('');
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
    setUsername('');
    setNama('');
    setAkunId('');
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setUsername(item?.username || '');
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
    if (!username.trim()) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Username tidak boleh kosong" });
      return;
    }
    if ((!/^[a-zA-Z\s]+$/.test(nama))) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Nama tidak boleh mengandung angka dan simbol" });
      return;
    }
    const payload = {
      username: username.trim(),
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
        const generatedPassword = res?.data?.responseData?.password || 'TRI12345';
        setList((prev) => [created, ...prev]);
        
        // Show success message with credential information
        Swal.fire({
          icon: "success",
          title: "Wali Kelas Berhasil Ditambahkan",
          html: `
            <div class="text-left">
              <p class="mb-3 text-green-600 font-semibold">✅ Wali kelas berhasil ditambahkan!</p>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-blue-800 mb-2">📋 Informasi Login:</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex space-x-1">
                    <span class="text-gray-600">Username:</span>
                    <span class="font-mono bg-gray-100 px-2 py-1 rounded">${payload.username}</span>
                  </div>
                  <div class="flex space-x-1">
                    <span class="text-gray-600">Password:</span>
                    <span class="font-mono bg-gray-100 px-2 py-1 rounded">${generatedPassword}</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 class="font-semibold text-orange-800 mb-2">⚠️ Penting:</h4>
                <p class="text-sm text-orange-700">
                  Harap segera minta wali kelas untuk <strong>mengganti password default</strong> 
                  setelah login pertama kali untuk keamanan akun.
                </p>
              </div>
            </div>
          `,
          confirmButtonText: "OK, Mengerti",
          confirmButtonColor: "#003366",
          width: 500,
          allowOutsideClick: false,
          allowEscapeKey: false
        });
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
      text: `Hapus wali kelas ${item.nama} (${item.username})?`,
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

  async function handleDeleteAll() {
    const result = await Swal.fire({
      title: 'Hapus Semua Wali Kelas',
      html: `
        <div class="text-left">
          <p class="mb-2">Apakah Anda yakin ingin menghapus <strong>SEMUA DATA WALI KELAS</strong>?</p>
          <p class="text-red-600 font-semibold mb-2">⚠️ PERINGATAN:</p>
          <ul class="text-sm text-gray-700 list-disc list-inside">
            <li>Semua data wali kelas akan dihapus permanen</li>
            <li>Semua akun login wali kelas akan dihapus</li>
            <li>Kelas yang terkait akan kehilangan wali kelas</li>
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
          const response = await adminAPI.deleteAllWaliKelas();
          if (response.status === 200 && response.data.responseStatus) {
            setList([]);
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Semua data wali kelas berhasil dihapus'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: response.data.responseMessage || 'Gagal menghapus semua wali kelas'
            });
          }
        } catch (error) {
          const msg = error?.response?.data?.responseMessage || 'Terjadi kesalahan saat menghapus semua wali kelas';
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
      key: 'username',
      label: 'Username',
      sortable: true,
      accessor: (item) => item.username
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
  const searchFields = ['username', 'nama'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Wali Kelas</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteAll}
            disabled={list.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash size={16} />
            Hapus Semua
          </button>
          <button onClick={openAdd} className="bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244]">Tambah Wali Kelas</button>
        </div>
      </div>

      <DataTable
        data={list}
        columns={columns}
        searchFields={searchFields}
        searchPlaceholder="Cari username atau nama wali kelas..."
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Username" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" required placeholder="Nama Wali Kelas" />
                </div>
                {/* Akun dibuat otomatis dari username saat tambah */}
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
