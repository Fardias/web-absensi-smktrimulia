import { useEffect, useState } from 'react'
import { Trash } from "lucide-react";
import { adminAPI } from "../../services/api";
import { Loading, DataTable } from "../../components";
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
        adminAPI.getWaliKelas(),
      ]);
      const kelasArr = klsRes?.data?.responseData?.kelas ?? [];
      setList(Array.isArray(kelasArr) ? kelasArr : []);
      setJurusan(jurRes?.data?.responseData?.jurusan ?? []);
      setWalas(walRes?.data?.responseData?.walas ?? []);
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
    if (!/^[a-zA-Z0-9\s]+$/.test(paralel) && paralel.length > 0) {
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
        const updated = res?.data?.responseData?.kelas;
        setList((prev) => prev.map((x) => (x.kelas_id === editing.kelas_id ? updated : x)));
        Swal.fire({ icon: "success", title: "Berhasil", text: "Kelas berhasil diperbarui" });
      } else {
        const res = await adminAPI.createKelas(payload);
        const created = res?.data?.responseData?.kelas;
        setList((prev) => [created, ...prev]);
        Swal.fire({ icon: "success", title: "Berhasil", text: "Kelas berhasil ditambahkan" });
      }
      closeModal();
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Gagal menyimpan kelas";
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
      const msg = e?.response?.data?.responseMessage || "Gagal menghapus kelas";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAll() {
    const result = await Swal.fire({
      title: 'Hapus Semua Kelas',
      html: `
        <div class="text-left">
          <p class="mb-2">Apakah Anda yakin ingin menghapus <strong>SEMUA DATA KELAS</strong>?</p>
          <p class="text-red-600 font-semibold mb-2">⚠️ PERINGATAN:</p>
          <ul class="text-sm text-gray-700 list-disc list-inside">
            <li>Semua data kelas akan dihapus permanen</li>
            <li>Semua siswa akan kehilangan kelas</li>
            <li>Semua riwayat kelas akan dihapus</li>
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
          const response = await adminAPI.deleteAllKelas();
          if (response.status === 200 && response.data.responseStatus) {
            setList([]);
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Semua data kelas berhasil dihapus'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: response.data.responseMessage || 'Gagal menghapus semua kelas'
            });
          }
        } catch (error) {
          const msg = error?.response?.data?.responseMessage || 'Terjadi kesalahan saat menghapus semua kelas';
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
    return <Loading text="Memuat data kelas..." />;
  }

  // Define columns for DataTable
  const columns = [
    {
      key: 'no',
      label: 'No',
      render: (item, index) => index + 1
    },
    {
      key: 'kelas',
      label: 'Kelas',
      sortable: true,
      accessor: (item) => `${item.tingkat} ${item.jurusan?.nama_jurusan} ${item.paralel || ''}`,
      sortValue: (item) => `${item.tingkat} ${item.jurusan?.nama_jurusan} ${item.paralel || ''}`
    },
    {
      key: 'walas',
      label: 'Wali Kelas',
      sortable: true,
      accessor: (item) => item.walas?.nama || '-',
      sortValue: (item) => item.walas?.nama || ''
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
  const searchFields = [
    (item) => `${item.tingkat} ${item.jurusan?.nama_jurusan} ${item.paralel || ''}`,
    (item) => item.walas?.nama || '',
    'tingkat',
    (item) => item.jurusan?.nama_jurusan || ''
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Kelas</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteAll}
            disabled={list.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash size={16} />
            Hapus Semua
          </button>
          <button onClick={openAdd} className="bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244]">Tambah Kelas</button>
        </div>
      </div>


      <DataTable
        data={list}
        columns={columns}
        searchFields={searchFields}
        searchPlaceholder="Cari kelas atau wali kelas..."
        emptyMessage="Belum ada kelas"
        defaultSort={{ field: 'kelas', direction: 'asc' }}
      />

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
                      <option key={w.walas_id} value={w.walas_id}>{w.nama} ({w.username})</option>
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
