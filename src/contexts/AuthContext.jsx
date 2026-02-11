import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';
import { handleApiError } from '../services/api';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export const useAuth = () => {

  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization in strict mode
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      try {
        // Verifikasi token dengan backend (token ada di httpOnly cookie)
        const response = await authAPI.me();
        if (response.data.responseStatus) {
          setUser(response.data.responseData);
        } else {
          // Response tidak valid, set user ke null
          setUser(null);
        }
      } catch (error) {
        // Token expired, tidak valid, atau error lainnya
        console.log('No valid session found:', error.response?.status);
        setUser(null);
      } finally {
        // Pastikan loading selalu di-set ke false
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Empty dependency array

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const data = response.data;

      if (data.responseStatus) {
        const userData = data?.responseData?.user ?? data?.responseData;

        // Update state - token disimpan otomatis di httpOnly cookie
        setUser(userData);

        return { success: true, data: userData };
      } else {
        return { success: false, message: data.responseMessage };
      }
    } catch (error) {
      // Handle schedule validation error for guru piket
      if (error.response?.status === 403 && error.response?.data?.responseMessage?.includes('Jadwal Piket')) {
        const errorData = error.response.data.errors;
        
        // Show detailed SweetAlert for schedule validation
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak',
          html: `
            <div class="text-left">
              <p class="mb-3 text-red-600 font-semibold">🚫 Anda tidak terjadwal sebagai guru piket hari ini</p>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-blue-800 mb-2">📅 Informasi Hari Ini:</h4>
                <div class="space-y-1 text-sm">
                  <div><strong>Hari:</strong> ${errorData.hari_ini}</div>
                  <div><strong>Tanggal:</strong> ${errorData.tanggal_ini}</div>
                  ${errorData.guru_piket_hari_ini 
                    ? `<div><strong>Guru Piket Hari Ini:</strong> ${errorData.guru_piket_hari_ini.nama} (${errorData.guru_piket_hari_ini.username})</div>`
                    : '<div><strong>Guru Piket Hari Ini:</strong> Tidak ada yang terjadwal</div>'
                  }
                </div>
              </div>
              
              ${errorData.jadwal_terdekat 
                ? `<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-green-800 mb-2">📋 Jadwal Piket Anda Berikutnya:</h4>
                    <div class="text-sm">
                      <div><strong>Hari:</strong> ${errorData.jadwal_terdekat.hari}</div>
                      <div><strong>Tanggal:</strong> ${errorData.jadwal_terdekat.tanggal_formatted}</div>
                    </div>
                  </div>`
                : `<div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 class="font-semibold text-orange-800 mb-2">⚠️ Perhatian:</h4>
                    <p class="text-sm text-orange-700">
                      Anda belum memiliki jadwal piket yang terdaftar. 
                      Silakan hubungi admin untuk mengatur jadwal piket Anda.
                    </p>
                  </div>`
              }
            </div>
          `,
          confirmButtonText: 'Mengerti',
          confirmButtonColor: '#dc2626',
          width: 500,
          allowOutsideClick: false,
          allowEscapeKey: false
        });
        
        return { 
          success: false, 
          message: error.response.data.responseMessage,
          isScheduleError: true 
        };
      }
      
      const errorMessage = handleApiError(error, 'Gagal login. Periksa username dan password Anda.');
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Reset state - cookie akan dihapus oleh backend
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.refresh();
      const data = response.data;

      if (data.responseStatus) {
        // Token baru disimpan otomatis di httpOnly cookie
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

