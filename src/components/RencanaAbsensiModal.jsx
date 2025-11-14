import React from "react";

const RencanaAbsensiModal = ({ show, onClose, formData, onChange, onSubmit, kelasList }) => {
  if (!show) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Tambah Rencana Absensi
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tanggal
            </label>
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={onChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Status Hari
            </label>
            <select
              name="status_hari"
              value={formData.status_hari}
              onChange={onChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Pilih Status Hari --</option>
              <option value="normal">Normal</option>
              <option value="libur">Libur</option>
              <option value="acara khusus">Acara Khusus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kelas</label>
            <select
              name="kelas_id"
              value={formData.kelas_id}
              onChange={onChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map((k) => (
                <option key={k.kelas_id} value={k.kelas_id}>
                  {`${k.tingkat}${k.paralel ? ` ${k.paralel}` : ""} - ${
                    k.jurusan
                  } (${k.thn_ajaran})`}
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
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RencanaAbsensiModal;