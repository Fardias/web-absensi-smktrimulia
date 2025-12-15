import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

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
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Verifikasi token dengan backend
          const response = await authAPI.me();
          if (response.data.responseStatus) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } else {
            // Token tidak valid, hapus dari storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token expired atau tidak valid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const data = response.data;

      if (data.responseStatus) {
        const access_token =
          data?.responseData?.access_token ??
          data?.responseHeader?.access_token;
        const userData =
          data?.responseData?.user ?? data?.responseData;

        // Simpan ke localStorage
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Update state
        setToken(access_token);
        setUser(userData);

        return { success: true, data: userData };
      } else {
        return { success: false, message: data.responseMessage };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.responseMessage || 'Terjadi kesalahan pada server'
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Hapus dari localStorage dan state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.refresh();
      const data = response.data;

      if (data.responseStatus) {
        const access_token =
          data?.responseData?.access_token ??
          data?.responseHeader?.access_token;
        localStorage.setItem('token', access_token);
        setToken(access_token);
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
    token,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

