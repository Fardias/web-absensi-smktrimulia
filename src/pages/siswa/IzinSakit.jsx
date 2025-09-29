import { useAuth } from '../../contexts/AuthContext';
import { Header, Loading } from '../../components';
import { useState } from 'react';
import { useAbsensi } from '../../hooks';

const IzinSakit = () => {
  const { user } = useAuth();
  const { handleAbsen } = useAbsensi();
  const [formData, setFormData] = useState({
    tanggal: '',
    keterangan: '',
    file: null,
  });

  if (!user) {
    return <Loading text="Memuat data user..." />;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('tanggal', formData.tanggal);
    data.append('keterangan', formData.keterangan);
    if (formData.file) {
      data.append('file', formData.file);
    }

    // TODO: kirim ke API
    console.log('Form dikirim:', {
      tanggal: formData.tanggal,
      keterangan: formData.keterangan,
      file: formData.file,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Izin/Sakit"
        subtitle="SMK Trimulia"
        showBackButton={true}
        backPath="/siswa/home"
      />

      {/* Main Content */}
      <main className="max-w-2xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="p-8 bg-white shadow-lg rounded-2xl">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">
            Form Izin / Sakit
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tanggal */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Tanggal
              </label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className="border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            {/* Keterangan */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Keterangan
              </label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows="4"
                placeholder="Tulis alasan izin atau sakit..."
                className="p-2 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            {/* Upload File */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Upload File (Opsional)
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: JPG, PNG, atau PDF (maks 2MB).
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-4 py-3 font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Kirim Pengajuan
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default IzinSakit;
