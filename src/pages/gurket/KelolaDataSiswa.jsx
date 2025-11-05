import React, { useEffect, useState } from "react";
import { guruAPI } from "../../services/api";
import { Loading } from "../../components";
import EditSiswaForm from "../../components/EditSiswaForm";

const KelolaDataSiswa = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [formData, setFormData] = useState({});

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
      kelas: siswa.kelas,
      username: siswa.akun.username,
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
        // Refresh list
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

      {/* Table styled like LihatAbsensi.jsx */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">NIS</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nama</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Jenis Kelamin</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tingkat</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Jurusan</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Username</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {siswaList.map((siswa) => (
              <tr key={siswa.siswa_id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{siswa.nis}</td>
                <td className="px-4 py-3 text-sm">{siswa.nama}</td>
                <td className="px-4 py-3 text-sm">{siswa.jenkel}</td>
                <td className="px-4 py-3 text-sm">{siswa.kelas.tingkat}</td>
                <td className="px-4 py-3 text-sm">{siswa.kelas.jurusan}</td>
                <td className="px-4 py-3 text-sm">{siswa.akun.username}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => handleEdit(siswa)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KelolaDataSiswa;
