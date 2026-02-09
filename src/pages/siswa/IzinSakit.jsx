import { useAuth } from '../../contexts/AuthContext';
import { Loading, BottomNavbar, LoadingButton } from '../../components';
import { useState } from 'react';
import { useAbsensi } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { validateForm, validators, validateFile } from '../../utils/validation';
import toast, { Toaster } from 'react-hot-toast';

const IzinSakit = () => {
   const { handleIzin, handleSakit, loading } = useAbsensi();
   const { user } = useAuth();
   const navigate = useNavigate();

   const today = new Date().toISOString().split('T')[0];
   const [selectedType, setSelectedType] = useState('izin'); // "izin" atau "sakit"

   const [formData, setFormData] = useState({
      tanggal: today,
      keterangan: '',
      bukti: null,
   });

   const [errors, setErrors] = useState({});

   if (!user) return <Loading text="Memuat data user..." />;

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

      // Validation using utility
      const validationRules = {
         keterangan: [validators.required, validators.minLength(10)],
         tanggal: [validators.required]
      };

      const { isValid, errors: validationErrors } = validateForm(formData, validationRules);
      
      // File validation
      if (formData.bukti) {
         const fileError = validateFile(formData.bukti, {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
         });
         if (fileError) {
            validationErrors.bukti = fileError;
         }
      }

      setErrors(validationErrors);

      if (!isValid) {
         toast.error("Harap perbaiki kesalahan pada form ❌");
         return;
      }

      const data = new FormData();
      data.append('tanggal', formData.tanggal);
      data.append('keterangan', formData.keterangan);
      // Kirim bukti hanya jika ada
      if (formData.bukti) {
        data.append('bukti', formData.bukti);
      }
      data.append('jenis_absen', selectedType);

      const loadingToastId = toast.loading(
         selectedType === 'izin' ? 'Mengirim pengajuan izin...' : 'Mengirim pengajuan sakit...'
      );

      try {
         const result =
            selectedType === 'izin'
               ? await handleIzin(data)
               : await handleSakit(data);

         if (result.success) {
            toast.success(
               selectedType === 'izin'
                  ? 'Pengajuan izin berhasil dikirim ✅'
                  : 'Pengajuan sakit berhasil dikirim ✅',
               { id: loadingToastId }
            );

            setFormData({
               tanggal: today,
               keterangan: '',
               bukti: null,
            });
            setErrors({});
         } else {
            toast.error(result.message || 'Gagal mengirim pengajuan ❌', { id: loadingToastId });
         }
      } catch (err) {
         toast.error('Terjadi kesalahan saat mengirim pengajuan ❌', { id: loadingToastId });
         console.error(err);
      }
   };

   return (
      <div className="min-h-screen bg-gray-50 pb-20">
         {/* Max width wrapper untuk tampilan mobile-like di semua device */}
         <div className="mx-auto max-w-md">
            {/* Header */}
            <div className="px-4 pt-8 pb-6 bg-gradient-to-br from-[#4A90E2] to-[#357ABD]">
               <div className="flex items-center justify-between text-white">
                  <div>
                     <p className="text-2xl font-bold">Izin / Sakit</p>
                     <p className="text-sm opacity-90">SMK Trimulia</p>
                  </div>
                  <button 
                     onClick={() => navigate('/siswa/home')} 
                     className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors"
                  >
                     Kembali
                  </button>
               </div>
            </div>

         <main className="px-4 py-8">
            <div className="p-8 bg-white shadow-lg rounded-2xl">
               <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">
                  Form Pengajuan Izin / Sakit
               </h2>

               {/* PILIHAN JENIS */}
               <div className="flex justify-center mb-8">
                  <div className="flex p-1 space-x-2 bg-gray-100 rounded-lg">
                     <button
                        type="button"
                        onClick={() => setSelectedType('izin')}
                        className={`px-4 py-2 rounded-md font-medium transition-all duration-200 
                           ${selectedType === 'izin'
                              ? 'bg-indigo-600 text-white shadow'
                              : 'text-gray-700 hover:bg-gray-200'}`}
                     >
                        Izin
                     </button>
                     <button
                        type="button"
                        onClick={() => setSelectedType('sakit')}
                        className={`px-4 py-2 rounded-md font-medium transition-all duration-200 
                           ${selectedType === 'sakit'
                              ? 'bg-indigo-600 text-white shadow'
                              : 'text-gray-700 hover:bg-gray-200'}`}
                     >
                        Sakit
                     </button>
                  </div>
               </div>

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
                        readOnly
                        className="p-2 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                     />
                  </div>

                  {/* Keterangan */}
                  <div className="flex flex-col">
                     <label className="mb-1 text-sm font-medium text-gray-700">
                        {selectedType === 'izin' ? 'Alasan Izin' : 'Keterangan Sakit'}
                     </label>
                     <textarea
                        name="keterangan"
                        value={formData.keterangan}
                        onChange={handleChange}
                        rows="4"
                        placeholder={
                           selectedType === 'izin'
                              ? 'Tulis alasan izin...'
                              : 'Tulis keterangan sakit...'
                        }
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
                        {selectedType === 'izin'
                           ? 'Upload Bukti (opsional: surat izin, dll)'
                           : 'Upload Bukti (opsional: surat dokter/bukti sakit)'}
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
                        Opsional. Format: JPG, PNG, atau PDF (maks 2MB).
                     </p>
                     {/* Tidak akan muncul error untuk bukti karena sudah opsional */}
                     {errors.bukti && (
                        <p className="mt-1 text-xs text-red-600">{errors.bukti}</p>
                     )}

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
                     <LoadingButton
                        type="submit"
                        loading={loading}
                        className="w-full px-4 py-3 font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                     >
                        {selectedType === 'izin'
                           ? 'Kirim Pengajuan Izin'
                           : 'Kirim Pengajuan Sakit'}
                     </LoadingButton>
                  </div>
               </form>
            </div>
         </main>

         <div className="fixed z-50 bottom-16 right-4">
            <Toaster position="bottom-right" reverseOrder={false} />
         </div>

         {/* Bottom Navigation */}
         <BottomNavbar />
         </div>
      </div>
   );
};

export default IzinSakit;
