import React from "react";

const RencanaAbsensiModal = ({ show, onClose, formData, onChange, onSubmit }) => {
  if (!show) return null;

  const today = new Date().toISOString().split("T")[0];
  const formatRangeNote = () => {
    if (!formData.tanggal) return "";
    const start = new Date(formData.tanggal + "T00:00:00");
    const end = new Date(start);
    end.setDate(start.getDate() + 364); // 365 hari (1 tahun)
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const startDay = start.getDate();
    const startMonth = months[start.getMonth()];
    const startYear = start.getFullYear();
    const endDay = end.getDate();
    const endMonth = months[end.getMonth()];
    const endYear = end.getFullYear();
    return `Rencana absensi akan dibuat untuk tanggal ${startDay} ${startMonth} ${startYear} s.d. ${endDay} ${endMonth} ${endYear} (1 tahun ke depan).`;
  };

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
              min={today}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>



          <div>
            <label className="block text-sm font-medium mb-1">
              Buat selama 1 tahun ke depan
            </label>
            <select
              name="mode"
              value={formData.mode}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="single">Tidak</option>
              <option value="week">Ya</option>
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

          {formData.mode === "week" && formData.tanggal && (
            <div className="text-sm text-gray-700 bg-gray-50 border rounded-lg px-3 py-2">
              {formatRangeNote()}
            </div>
          )}

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
