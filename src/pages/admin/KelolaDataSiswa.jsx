import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { adminAPI, utilityAPI } from "../../services/api";
import { Loading, DataTable } from "../../components";
import EditSiswaForm from "../../components/EditSiswaForm";

const KelolaDataSiswa = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [formData, setFormData] = useState({});
  const [kelasList, setKelasList] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newSiswa, setNewSiswa] = useState({ nis: "", nama: "", jenkel: "L", kelas_id: "" });

  // Additional filters for DataTable
  const [filterJenkel, setFilterJenkel] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [filterParalel, setFilterParalel] = useState("");

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
      jurusan: siswa.kelas?.jurusan?.nama_jurusan || "",
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
      };
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

  const tingkatOptions = useMemo(() => {
    const vals = siswaList.map((s) => s.kelas?.tingkat).filter(Boolean);
    return Array.from(new Set(vals));
  }, [siswaList]);

  const jurusanOptions = useMemo(() => {
    const vals = siswaList
      .map((s) => s.kelas?.jurusan?.nama_jurusan || s.kelas?.jurusan)
      .filter(Boolean);
    return Array.from(new Set(vals));
  }, [siswaList]);

  const paralelOptions = useMemo(() => {
    const vals = siswaList.map((s) => s.kelas?.paralel).filter(Boolean);
    return Array.from(new Set(vals));
  }, [siswaList]);

  // Filter data based on additional filters
  const filteredSiswaList = useMemo(() => {
    return siswaList.filter((s) => {
      if (filterJenkel && (s.jenkel || "").toString() !== filterJenkel) return false;
      const tingkat = s.kelas?.tingkat ? String(s.kelas.tingkat) : "";
      if (filterTingkat && tingkat !== filterTingkat) return false;
      const jurusanVal = s.kelas?.jurusan?.nama_jurusan || s.kelas?.jurusan || "";
      if (filterJurusan && String(jurusanVal) !== filterJurusan) return false;
      const paralelVal = s.kelas?.paralel ? String(s.kelas.paralel) : "";
      if (filterParalel && paralelVal !== filterParalel) return false;
      return true;
    });
  }, [siswaList, filterJenkel, filterTingkat, filterJurusan, filterParalel]);

  const resetFilter = () => {
    setFilterJenkel("");
    setFilterTingkat("");
    setFilterJurusan("");
    setFilterParalel("");
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
        Swal.fire({ icon: "success", title: "Berhasil", text: "Siswa berhasil ditambahkan." });
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: res.data.responseMessage || "Gagal menambah siswa" });
      }
    } catch (e) {
      const msg = e?.response?.data?.responseMessage || "Terjadi kesalahan saat menambah siswa";
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    }
  };

  // Loading & Error state
  if (loading) return <Loading text="Loading data siswa..." />;
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
      key: 'actions',
      label: 'Aksi',
      render: (item) => (
        <button 
          onClick={() => handleEdit(item)} 
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          Edit
        </button>
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
        <button 
          onClick={() => setShowCreate((v) => !v)} 
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {showCreate ? "Tutup" : "Tambah Siswa"}
        </button>
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
          jurusanList={jurusanList}
        />
      )}

      {/* Additional Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
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
            value={filterTingkat}
            onChange={(e) => setFilterTingkat(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Tingkat</option>
            {tingkatOptions.map((opt) => (
              <option key={String(opt)} value={String(opt)}>{String(opt)}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterJurusan}
            onChange={(e) => setFilterJurusan(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Jurusan</option>
            {jurusanOptions.map((opt) => (
              <option key={String(opt)} value={String(opt)}>{String(opt)}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterParalel}
            onChange={(e) => setFilterParalel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Paralel</option>
            {paralelOptions.map((opt) => (
              <option key={String(opt)} value={String(opt)}>{String(opt)}</option>
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
