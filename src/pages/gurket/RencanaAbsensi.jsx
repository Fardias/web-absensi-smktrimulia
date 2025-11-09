import React, { useEffect, useState } from "react";
import { guruAPI, utilityAPI } from "../../services/api";
import { Loading } from "../../components";
import Error from "../../components/Error";

const RencanaAbsensi = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: "",
    status_hari: "hari_kerja",
    keterangan: "",
    kelas_id: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRencana, resKelas] = await Promise.all([
          guruAPI.getRencanaAbsensi(),
          utilityAPI.listKelas(),
        ]);

        if (resRencana.data.responseStatus) {
          setData(resRencana.data.responseData);
        } else {
          setError(resRencana.data.responseMessage || "Gagal memuat data");
        }

        if (resKelas.data.responseStatus) {
          setKelasList(resKelas.data.responseData);
        }
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const grouped = data.reduce((acc, curr) => {
    if (!acc[curr.tanggal]) acc[curr.tanggal] = [];
    acc[curr.tanggal].push(curr);
    return acc;
  }, {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await guruAPI.createRencanaAbsensi(formData);
      if (res.data.responseStatus) {
        setShowModal(false);
        setFormData({
          tanggal: "",
          status_hari: "hari_kerja",
          keterangan: "",
          kelas_id: "",
        });
        // refresh data
        const updated = await guruAPI.getRencanaAbsensi();
        setData(updated.data.responseData);
      } else {
        alert(res.data.responseMessage || "Gagal menambahkan rencana absensi");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengirim data");
      console.error(err);
    }
  };

  if (loading) return <Loading text="Memuat data rencana absensi..." />;

  if (error) return <Error message={error} />;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Rencana Absensi</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Tambah Rencana
        </button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-600">Tidak ada data rencana absensi.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([tanggal, records]) => (
            <div key={tanggal} className="bg-white rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-3">
                {new Date(tanggal).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {records.map((r) => (
                  <div
                    key={`${r.tanggal}-${r.kelas.kelas_id}`}
                    className="border rounded p-3 hover:bg-gray-50"
                  >
                    <p className="font-medium">
                      {r.kelas.tingkat} {r.kelas.paralel} - {r.kelas.jurusan}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      Status hari: {r.status_hari}
                    </p>
                    {r.keterangan && (
                      <p className="text-sm text-gray-500 mt-1">
                        Keterangan: {r.keterangan}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Tambah Rencana Absensi
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Status Hari
                </label>
                <select
                  name="status_hari"
                  value={formData.status_hari}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="hari_kerja">Hari Kerja</option>
                  <option value="libur">Libur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kelas</label>
                <select
                  name="kelas_id"
                  value={formData.kelas_id}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {kelasList.map((k) => (
                    <option key={k.kelas_id} value={k.kelas_id}>
                      {`${k.tingkat}${k.paralel ? ` ${k.paralel}` : ""} - ${k.jurusan} (${k.thn_ajaran})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Keterangan (opsional)
                </label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RencanaAbsensi;
