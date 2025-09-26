import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setError('');
          setLoading(false);
        },
        (error) => {
          setError('Tidak dapat mengakses lokasi. Pastikan GPS aktif.');
          setLoading(false);
        }
      );
    } else {
      setError('Browser tidak mendukung geolocation.');
      setLoading(false);
    }
  }, []);

  return {
    location,
    error,
    loading
  };
};
