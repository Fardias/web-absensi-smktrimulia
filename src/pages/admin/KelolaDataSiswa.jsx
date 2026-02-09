import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Edit2, Eye, Trash2, Trash } from "lucide-react";
import { adminAPI, utilityAPI } from "../../services/api";
import { Loading, DataTable } from "../../components";
import { TableSkeleton, ListSkeleton } from "../../components/LoadingSkeleton";
import EditSiswaForm from "../../components/EditSiswaForm";

const KelolaDataSiswa = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [formData, setFormData] = useState({});
  const [kelasList, setKelasList] = useState([]);
  const [rawKelasList, setRawKelasList] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newSiswa, setNewSiswa] = useState({ nis: "", nama: "", jenkel: "L", kelas_id: "" });

  // Riwayat Modal State
  const [showRiwayatModal, setShowRiwayatModal] = useState(false);
  const [riwayatList, setRiwayatList] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [selectedSiswaName, setSelectedSiswaName] = useState("");

  // Additional filters for DataTable
  const [filterJenkel, setFilterJenkel] = useState("");
  const [filterKelas, setFilterKelas] = useState("");

  useEffect(() => {
    const fetchDataSiswa = async () => {
      try {
        const response = await adminAPI.getDataSiswa();
        if (response.status === 200 && response.data.responseStatus) {
          setSiswaList(response.data.responseData);
        } else {
          setError(response.data.responseMessage || "Gagal memuat data siswa");
        }
      } catch {
        setError("Terjadi kesalahan saat memuat data siswa");
      } finally {
        setLoading(false);
      }
    };
    fetchDataSiswa();
  }, []);

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await utilityAPI.listKelas();
        const data = res?.data?.responseData ?? [];
        console.log("data kelas:", data);
        setRawKelasList(data);
        // cek jika paralel = null maka null jadikan string kosong
        const list = data.map((k) => ({ id: k.kelas_id, label: `${k.tingkat} ${k.jurusan?.nama_jurusan ?? k.jurusan} ${k.paralel || ""}` }));
        setKelasList(list);
      } catch {
        setKelasList([]);
      }
    };
    fetchKelas();
  }, []);

  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        const res = await adminAPI.getJurusan();
        const arr = res?.data?.responseData?.jurusan ?? [];
        setJurusanList(Array.isArray(arr) ? arr : []);
      } catch {
        setJurusanList([]);
      }
    };
    fetchJurusan();
  }, []);

  const handleEdit = (siswa) => {
    setEditingSiswa(siswa.siswa_id);
    setFormData({
      nis: siswa.nis,
      nama: siswa.nama,
      jenkel: siswa.jenkel,
      kelas_id: siswa.kelas_id || siswa.kelas?.kelas_id || "",
      status: siswa.status || "aktif",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        nis: formData.nis,
        nama: formData.nama,
        jenkel: formData.jenkel,
        username: formData.nis,
        status: formData.status,
      };

      if (formData.kelas_id) {
        payload.kelas_id = Number(formData.kelas_id);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Kelas wajib dipilih."
        });
        return;
      }

      if (formData.password && String(formData.password).length > 0) {
        payload.password = formData.password;
      }
      const response = await adminAPI.updateSiswa(editingSiswa, payload);
      if (response.status === 200 && response.data.responseStatus) {
        const updated = await adminAPI.getDataSiswa();
        setSiswaList(updated.data.responseData);
        setEditingSiswa(null);
        Swal.fire({ icon: "success", title: "Berhasil", text: "Data siswa berhasil diperbarui" });
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: response.data.responseMessage || "Gagal memperbarui data" });
      }
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Terjadi kesalahan saat menyimpan data";
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    }
  };

  const handleCancel = () => {
    setEditingSiswa(null);
    setFormData({});
  };

  const handleViewRiwayat = async (siswa) => {
    setSelectedSiswaName(siswa.nama);
    setShowRiwayatModal(true);
    setLoadingRiwayat(true);
    setRiwayatList([]);
    try {
      const res = await adminAPI.getRiwayatKelas({ siswa_id: siswa.siswa_id });
      const data = res?.data?.responseData?.riwayat ?? [];
      setRiwayatList(data);
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal memuat riwayat kelas" });
    } finally {
      setLoadingRiwayat(false);
    }
  };

  const handleDelete = async (siswa) => {
    const result = await Swal.fire({
      title: 'Hapus Siswa',
      text: `Apakah Anda yakin ingin menghapus siswa ${siswa.nama} (${siswa.nis})? Data absensi dan riwayat kelas akan ikut terhapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const response = await adminAPI.deleteSiswa(siswa.siswa_id);
        if (response.status === 200 && response.data.responseStatus) {
          // Refresh data siswa
          const updated = await adminAPI.getDataSiswa();
          setSiswaList(updated.data.responseData);
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Siswa berhasil dihapus'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: response.data.responseMessage || 'Gagal menghapus siswa'
          });
        }
      } catch (error) {
        const msg = error?.response?.data?.responseMessage || 'Terjadi kesalahan saat menghapus siswa';
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: msg
        });
      }
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'Hapus Semua Siswa',
      html: `
        <div class="text-left">
          <p class="mb-2">Apakah Anda yakin ingin menghapus <strong>SEMUA DATA SISWA</strong>?</p>
          <p class="text-red-600 font-semibold mb-2">⚠️ PERINGATAN:</p>
          <ul class="text-sm text-gray-700 list-disc list-inside">
            <li>Semua data siswa akan dihapus permanen</li>
            <li>Semua riwayat kelas akan dihapus</li>
            <li>Semua data absensi akan dihapus</li>
            <li>Semua akun login siswa akan dihapus</li>
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
          const response = await adminAPI.deleteAllSiswa();
          if (response.status === 200 && response.data.responseStatus) {
            // Refresh data siswa
            setSiswaList([]);
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Semua data siswa berhasil dihapus'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: response.data.responseMessage || 'Gagal menghapus semua siswa'
            });
          }
        } catch (error) {
          const msg = error?.response?.data?.responseMessage || 'Terjadi kesalahan saat menghapus semua siswa';
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: msg
          });
        }
      }
    }
  };

  // Filter data based on additional filters
  const filteredSiswaList = useMemo(() => {
    return siswaList.filter((s) => {
      if (filterJenkel && (s.jenkel || "").toString() !== filterJenkel) return false;
      if (filterKelas) {
        const kelasId = s.kelas_id || s.kelas?.kelas_id;
        if (!kelasId || String(kelasId) !== String(filterKelas)) return false;
      }
      return true;
    });
  }, [siswaList, filterJenkel, filterKelas]);

  const resetFilter = () => {
    setFilterJenkel("");
    setFilterKelas("");
  };

  const createSiswa = async () => {
    // Validasi awal agar SweetAlert muncul ketika input tidak sesuai
    const nis = String(newSiswa.nis || "").trim();
    const nama = String(newSiswa.nama || "").trim();
    const kelasIdStr = String(newSiswa.kelas_id || "").trim();
    if (!nis) {
      Swal.fire({ icon: "error", title: "Gagal", text: "NIS wajib diisi" });
      return;
    }
    if (!/^\d+$/.test(nis)) {
      Swal.fire({ icon: "error", title: "Gagal", text: "NIS hanya boleh mengandung angka" });
      return;
    }
    if (!nama) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Nama wajib diisi" });
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(nama)) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Nama tidak boleh mengandung angka dan simbol" });
      return;
    }
    if (!kelasIdStr) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Kelas wajib dipilih" });
      return;
    }
    const kelasIdNum = Number(kelasIdStr);
    if (Number.isNaN(kelasIdNum)) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Kelas tidak valid" });
      return;
    }

    try {
      const payload = { ...newSiswa, nis, nama, kelas_id: kelasIdNum };
      const res = await adminAPI.createSiswa(payload);
      if (res.status === 200 && res.data.responseStatus) {
        const updated = await adminAPI.getDataSiswa();
        setSiswaList(updated.data.responseData);
        setShowCreate(false);
        setNewSiswa({ nis: "", nama: "", jenkel: "L", kelas_id: "" });
        
        const generatedPassword = res?.data?.responseData?.password || 'TRI12345';
        
        // Show success message with credential information
        Swal.fire({
          icon: "success",
          title: "Siswa Berhasil Ditambahkan",
          html: `
            <div class="text-left">
              <p class="mb-3 text-green-600 font-semibold">✅ Siswa berhasil ditambahkan!</p>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-blue-800 mb-2">📋 Informasi Login:</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Username:</span>
                    <span class="font-mono bg-gray-100 px-2 py-1 rounded">${nis}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Password:</span>
                    <span class="font-mono bg-gray-100 px-2 py-1 rounded">${generatedPassword}</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 class="font-semibold text-orange-800 mb-2">⚠️ Penting:</h4>
                <p class="text-sm text-orange-700">
                  Harap segera minta siswa untuk <strong>mengganti password default</strong> 
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
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: res.data.responseMessage || "Gagal menambah siswa" });
      }
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Terjadi kesalahan saat menambah siswa";
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    }
  };

  // Loading & Error state
  if (loading) {
    return (
      <div className="px-4 py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <TableSkeleton rows={10} columns={6} />
      </div>
    );
  }
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  // Define columns for DataTable
  const columns = [
    {
      key: 'no',
      label: 'No',
      render: (item, index) => index + 1
    },
    {
      key: 'nis',
      label: 'NIS',
      sortable: true,
      accessor: (item) => item.nis || '-'
    },
    {
      key: 'nama',
      label: 'Nama',
      sortable: true,
      accessor: (item) => item.nama || '-'
    },
    {
      key: 'jenkel',
      label: 'Jenis Kelamin',
      sortable: true,
      accessor: (item) => item.jenkel === 'L' ? 'Laki-laki' : item.jenkel === 'P' ? 'Perempuan' : item.jenkel || '-'
    },
    {
      key: 'tingkat',
      label: 'Tingkat',
      sortable: true,
      accessor: (item) => item.kelas?.tingkat || '-'
    },
    {
      key: 'jurusan',
      label: 'Jurusan',
      sortable: true,
      accessor: (item) => item.kelas?.jurusan?.nama_jurusan || '-'
    },
    {
      key: 'paralel',
      label: 'Paralel',
      sortable: true,
      accessor: (item) => item.kelas?.paralel || '-'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      accessor: (item) => item.status || '-'
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleViewRiwayat(item)}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
            title="Lihat Riwayat"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  // Define search fields for DataTable
  const searchFields = [
    'nis',
    'nama',
    (item) => item.kelas?.jurusan?.nama_jurusan || '',
    (item) => item.kelas?.tingkat ? String(item.kelas.tingkat) : '',
    (item) => item.kelas?.paralel || ''
  ];

  return (
    <div className="flex flex-col p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Kelola Data Siswa</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteAll}
            disabled={siswaList.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash size={16} />
            Hapus Semua
          </button>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {showCreate ? "Tutup" : "Tambah Siswa"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-red-600 font-semibold">{error}</div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tambah Siswa</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                value={newSiswa.nis}
                onChange={(e) => setNewSiswa((p) => ({ ...p, nis: e.target.value }))}
                placeholder="NIS"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                value={newSiswa.nama}
                onChange={(e) => setNewSiswa((p) => ({ ...p, nama: e.target.value }))}
                placeholder="Nama"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <select
                value={newSiswa.jenkel}
                onChange={(e) => setNewSiswa((p) => ({ ...p, jenkel: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              <select
                value={newSiswa.kelas_id}
                onChange={(e) => setNewSiswa((p) => ({ ...p, kelas_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Pilih Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>{k.label}</option>
                ))}
              </select>
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={createSiswa}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:opacity-85"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingSiswa && (
        <EditSiswaForm
          formData={formData}
          handleChange={handleChange}
          handleSave={handleSave}
          handleCancel={handleCancel}
          kelasList={kelasList}
        />
      )}

      {/* Riwayat Modal */}
      {showRiwayatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRiwayatModal(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Riwayat Kelas: {selectedSiswaName}
              </h3>
              <button
                onClick={() => setShowRiwayatModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>

            {loadingRiwayat ? (
              <ListSkeleton items={5} />
            ) : riwayatList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada riwayat kelas tercatat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Kelas</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Tanggal Pencatatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {riwayatList.map((item, idx) => {
                      const kelasStr = item.kelas
                        ? `${item.kelas.tingkat} ${item.kelas.jurusan?.nama_jurusan || ""} ${item.kelas.paralel || ""}`
                        : "-";
                      const dateStr = item.created_at
                        ? new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        : "-";

                      return (
                        <tr key={item.riwayat_kelas_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{kelasStr}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === "aktif"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{dateStr}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowRiwayatModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <select
            value={filterJenkel}
            onChange={(e) => setFilterJenkel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Jenkel</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={resetFilter}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={filteredSiswaList}
        columns={columns}
        searchFields={searchFields}
        searchPlaceholder="Cari nama atau NIS siswa..."
        emptyMessage="Tidak ada data siswa"
        defaultSort={{ field: 'nama', direction: 'asc' }}
        defaultItemsPerPage={20}
      />
    </div>
  );
};

export default KelolaDataSiswa;
