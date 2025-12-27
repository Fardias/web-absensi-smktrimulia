import React, { useState } from "react";

const EditSiswaForm = ({ formData, handleChange, handleSave, handleCancel, kelasList = [] }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Edit Data Siswa
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* NIS */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">NIS</label>
            <input
              name="nis"
              value={formData.nis || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Nama */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Nama</label>
            <input
              name="nama"
              value={formData.nama || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Jenis Kelamin */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
            <select
              name="jenkel"
              value={formData.jenkel || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          {/* Kelas */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Kelas</label>
            <select
              name="kelas_id"
              value={formData.kelas_id || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Pilih Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>{k.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status || "aktif"}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="aktif">Aktif</option>
              <option value="naik kelas">Naik Kelas</option>
              <option value="tidak naik kelas">Tidak Naik Kelas</option>
            </select>
          </div>



          {/* Password */}
          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Password Baru</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak ingin mengubah"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSiswaForm;
