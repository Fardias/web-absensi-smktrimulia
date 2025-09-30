import { useState } from 'react';
import { absensiAPI } from '../services/api';

export const useAbsensi = () => {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const handleAbsen = async (type, data) => {
      setLoading(true);
      setError(null);

      try {
         // Gunakan endpoint yang berbeda berdasarkan tipe absensi
         const response = type === 'pulang'
            ? await absensiAPI.absenPulang(data)
            : await absensiAPI.absen(data);

         return {
            success: true,
            data: response.data
         };
      } catch (error) {
         const errorData = error.response?.data;

         // Jika error karena radius
         if (error.response?.status === 422 && errorData?.responseMessage?.includes('radius')) {
            const distance = errorData?.errors?.distance || null;
            return {
               success: false,
               message: errorData.responseMessage,
               distance: distance
            };
         }

         // Untuk error lainnya (termasuk validasi waktu)
         return {
            success: false,
            message: errorData?.responseMessage || 'Terjadi kesalahan pada server'
         };
      } finally {
         setLoading(false);
      }
   };

   const handleIzinSakit = async (formData) => {
      setLoading(true);
      setError(null);

      try {
         const response = await absensiAPI.izinSakit(formData);

         return {
            success: true,
            data: response.data,
         };
      } catch (error) {
         const errorData = error.response?.data;
         setError(
            errorData?.message ||
            errorData?.responseMessage ||
            'Terjadi kesalahan pada server'
         );
         return {
            success: false,
            message:
               errorData?.message ||
               errorData?.responseMessage ||
               'Terjadi kesalahan pada server',
            errors: errorData?.errors || null,
         };
      } finally {
         setLoading(false);
      }
   };


   return {
      handleAbsen,
      handleIzinSakit,
      loading,
      error
   };
};
