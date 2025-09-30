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

    



    return { handleTotalSiswa, loading, error };
};
