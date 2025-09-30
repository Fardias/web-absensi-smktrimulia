import { useAuth } from '../../contexts/AuthContext';
import { Header, Loading } from '../../components';
import { useState } from 'react';
import { useAbsensi } from '../../hooks';
import toast, { Toaster } from 'react-hot-toast';

const IzinSakit = () => {
   const { handleIzinSakit, loading } = useAbsensi();
   const { user } = useAuth();

   const today = new Date().toISOString().split('T')[0];

   const [formData, setFormData] = useState({
      tanggal: today,
      keterangan: '',
      bukti: null,
   });

   const [errors, setErrors] = useState({});

   if (!user) {
      return <Loading text="Memuat data user..." />;
   }

   const handleChange = (e) => {
      const { name, value, files } = e.target;

      if (name === 'bukti') {
         setFormData({ ...formData, bukti: files[0] });
         setErrors({ ...errors, bukti: null }); 
      } else {
         setFormData({ ...formData, [name]: value });
         setErrors({ ...errors, [name]: null });
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      // Validasi manual
      let newErrors = {};
      if (!formData.keterangan.trim()) newErrors.keterangan = "Keterangan wajib diisi";
      if (!formData.bukti) newErrors.bukti = "Bukti wajib diupload";

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
         toast.error("Harap lengkapi semua field ❌");
         return;
      }

      const data = new FormData();
      data.append('tanggal', formData.tanggal);
      data.append('keterangan', formData.keterangan);
      if (formData.bukti) {
         data.append('bukti', formData.bukti);
      }

      const loadingToastId = toast.loading('Mengirim pengajuan...');

      try {
         const result = await handleIzinSakit(data);

         if (result.success) {
            toast.success('Pengajuan izin/sakit berhasil dikirim ✅', { id: loadingToastId });
            setFormData({
               tanggal: today,
               keterangan: '',
               bukti: null,
            });
            setErrors({});
         } else {
            toast.error(result.message || 'Gagal mengirim pengajuan izin/sakit ❌', { id: loadingToastId });
         }
      } catch (err) {
         toast.error('Terjadi kesalahan saat mengirim pengajuan ❌', { id: loadingToastId });
         console.error("Error submitting form:", err);
      }
   };

   return (
      <div className="min-h-screen bg-gray-50">
         <Header
            title="Izin/Sakit"
            subtitle="SMK Trimulia"
            showBackButton={true}
            backPath="/siswa/home"
         />

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
                        className="p-2 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        readOnly
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
                        className={`p-2 rounded-lg shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.keterangan ? "border-red-500" : "border-gray-300"
                           }`}
                     />
                     {errors.keterangan && (
                        <p className="mt-1 text-xs text-red-600">{errors.keterangan}</p>
                     )}
                  </div>

                  {/* Upload File */}
                  <div className="flex flex-col">
                     <label className="mb-2 text-sm font-medium text-gray-700">
                        Upload File
                     </label>
                     <input
                        type="file"
                        name="bukti"
                        onChange={handleChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className={`block w-full text-sm text-gray-600 
                           file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm 
                           file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100
                           ${errors.bukti ? "border border-red-500" : ""}`}
                     />
                     <p className="mt-1 text-xs text-gray-500">
                        Format: JPG, PNG, atau PDF (maks 2MB).
                     </p>
                     {errors.bukti && (
                        <p className="mt-1 text-xs text-red-600">{errors.bukti}</p>
                     )}

                     {/* Preview file */}
                     {formData.bukti && (
                        <div className="mt-3">
                           {formData.bukti.type.startsWith("image/") ? (
                              <img
                                 src={URL.createObjectURL(formData.bukti)}
                                 alt="Preview"
                                 className="object-cover w-32 h-32 border rounded-lg"
                              />
                           ) : (
                              <p className="text-sm text-gray-700">
                                 File terpilih: <span className="font-medium">{formData.bukti.name}</span>
                              </p>
                           )}
                        </div>
                     )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                     >
                        {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
                     </button>
                  </div>
               </form>
            </div>
         </main>

         <div className="fixed z-50 bottom-16 right-4">
            <Toaster position="bottom-right" reverseOrder={false} />
         </div>
      </div>
   );
};

export default IzinSakit;
