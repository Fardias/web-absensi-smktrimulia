import { useState } from 'react';
import { generalAPI } from '../services/api';

export const useDataSiswa = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const handleTotalSiswa = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await generalAPI.totalSiswa();
            const { responseStatus, responseMessage, responseData } = response.data;

            if (!responseStatus) {
            setError(responseMessage || 'Failed to fetch total siswa');
            return null;
            }

            if (!responseData || typeof responseData.total_siswa !== 'number') {
            setError('Invalid data received');
            return null;
            }

            return responseData.total_siswa;
        } catch (error) {
            console.error('Error fetching total siswa:', error);
            setError('Failed to fetch total siswa');
            return null;
        } finally {
            setLoading(false);
        }
    }

    const handleSiswaHadirHariIni = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await generalAPI.siswaHadirHariIni();
            const { responseStatus, responseMessage, responseData } = response.data;

            if (!responseStatus) {
                setError(responseMessage || 'Failed to fetch siswa hadir hari ini');
                return null;
            }

            if (!responseData || typeof responseData.siswa_hadir_hariini !== 'number') {
                setError('Invalid data received');
                return null;
            }

            return responseData.siswa_hadir_hariini;
        } catch (error) {
            console.error('Error fetching siswa hadir hari ini:', error);
            setError('Failed to fetch siswa hadir hari ini');
            return null;
        } finally {
            setLoading(false);
        }
    }

    const handleSiswaTerlambat = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await generalAPI.siswaTerlambatHariIni();
            const { responseStatus, responseMessage, responseData } = response.data;
            if (!responseStatus) {
                setError(responseMessage || 'Failed to fetch siswa terlambat');
                return null;
            }
            if (!responseData || typeof responseData.siswa_terlambat_hariini !== 'number') {
                setError('Invalid data received');
                return null;
            }
            return responseData.siswa_terlambat_hariini;
        } catch (error) {
            console.error('Error fetching siswa terlambat:', error);
            setError('Failed to fetch siswa terlambat');
            return null;
        } finally {
            setLoading(false);
        }
    }

    const handleSiswaIzinSakit = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await generalAPI.siswaIzinHariIni();
            const { responseStatus, responseMessage, responseData } = response.data;    
            if (!responseStatus) {
                setError(responseMessage || 'Failed to fetch siswa izin');
                return null;
            }

            if (!responseData || typeof responseData.siswa_izin_sakit_hariini !== 'number') {
                setError('Invalid data received');
                return null;
            }

            return responseData.siswa_izin_sakit_hariini;
        } catch (error) {
            console.error('Error fetching siswa izin:', error);
            setError('Failed to fetch siswa izin');
            return null;
        } finally {
            setLoading(false);
        }
    }


    return { handleTotalSiswa, handleSiswaHadirHariIni, handleSiswaTerlambat, handleSiswaIzinSakit, loading, error };
};
