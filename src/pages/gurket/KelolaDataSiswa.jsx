import React, { useEffect, useMemo, useState } from "react";
import { guruAPI } from "../../services/api";
import { Loading } from "../../components";
import EditSiswaForm from "../../components/EditSiswaForm";

const KelolaDataSiswa = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState("");
  const [filterJenkel, setFilterJenkel] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [filterParalel, setFilterParalel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const fetchDataSiswa = async () => {
      try {
        const response = await guruAPI.getDataSiswa();
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

  const handleEdit = (siswa) => {
    setEditingSiswa(siswa.siswa_id);
    setFormData({
      nis: siswa.nis,
      nama: siswa.nama,
      jenkel: siswa.jenkel,
      tingkat: siswa.kelas?.tingkat || "",
      jurusan: siswa.kelas?.jurusan?.nama_jurusan || "",
      username: siswa.akun?.username || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await guruAPI.updateSiswa(editingSiswa, formData);
      if (response.status === 200 && response.data.responseStatus) {
        const updated = await guruAPI.getDataSiswa();
        setSiswaList(updated.data.responseData);
        setEditingSiswa(null);
      } else {
        alert(response.data.responseMessage || "Gagal memperbarui data");
      }
    } catch {
      alert("Terjadi kesalahan saat menyimpan data");
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterJenkel, filterTingkat, filterJurusan, filterParalel]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return siswaList.filter((s) => {
      if (filterJenkel && (s.jenkel || "").toString() !== filterJenkel) return false;
      const tingkat = s.kelas?.tingkat ? String(s.kelas.tingkat) : "";
      if (filterTingkat && tingkat !== filterTingkat) return false;
      const jurusanVal = s.kelas?.jurusan?.nama_jurusan || s.kelas?.jurusan || "";
      if (filterJurusan && String(jurusanVal) !== filterJurusan) return false;
      const paralelVal = s.kelas?.paralel ? String(s.kelas.paralel) : "";
      if (filterParalel && paralelVal !== filterParalel) return false;
      if (!q) return true;
      const nama = (s.nama || "").toLowerCase();
      const nis = (s.nis || "").toLowerCase();
      return nama.includes(q) || nis.includes(q);
    });
  }, [siswaList, search, filterJenkel, filterTingkat, filterJurusan, filterParalel]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedList = filteredList.slice(startIndex, startIndex + pageSize);

  const resetFilter = () => {
    setSearch("");
    setFilterJenkel("");
    setFilterTingkat("");
    setFilterJurusan("");
    setFilterParalel("");
  };

  // Loading & Error state
  if (loading) return <Loading text="Loading data siswa..." />;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="flex flex-col p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Kelola Data Siswa</h1>

      {editingSiswa && (
        <EditSiswaForm
          formData={formData}
          handleChange={handleChange}
          handleSave={handleSave}
          handleCancel={handleCancel}
        />
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Nama atau NIS"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-base">
          <thead className="table-thead">
            <tr>
              <th className="table-th">NIS</th>
              <th className="table-th">Nama</th>
              <th className="table-th">Jenis Kelamin</th>
              <th className="table-th">Tingkat</th>
              <th className="table-th">Jurusan</th>
              <th className="table-th">Paralel</th>
              <th className="table-th">Aksi</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {paginatedList.map((siswa) => (
              <tr key={siswa.siswa_id} className="table-tr hover:bg-gray-50">
                <td className="table-td">{siswa.nis}</td>
                <td className="table-td">{siswa.nama}</td>
                <td className="table-td">{siswa.jenkel}</td>
                <td className="table-td">{siswa.kelas?.tingkat || "-"}</td>
                <td className="table-td">{siswa.kelas?.jurusan?.nama_jurusan || "-"}</td>
                <td className="table-td">{siswa.kelas?.paralel || "-"}</td>
                <td className="table-td">
                  <button onClick={() => handleEdit(siswa)} className="text-blue-600 hover:underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-700">
          <div>
            Menampilkan {paginatedList.length} dari {filteredList.length} data
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              className="px-3 py-1 border rounded"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KelolaDataSiswa;
