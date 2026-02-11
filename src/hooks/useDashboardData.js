import { useState, useEffect, useRef } from 'react';
import { generalAPI, guruAPI, adminAPI } from '../services/api';

// Cache untuk menyimpan data dan timestamp
const cache = {
  stats: { data: null, timestamp: 0 },
  walasInfo: { data: null, timestamp: 0 },
  aktivitas: { data: null, timestamp: 0 },
  trendData: { data: null, timestamp: 0 }
};

// Global flags to prevent duplicate fetches across all instances
const fetchingFlags = {
  stats: false,
  walasInfo: false,
  aktivitas: false,
  trendData: false
};

const CACHE_DURATION = 30000; // 30 seconds

// Helper untuk check apakah cache masih valid
const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

export const useDashboardStats = (userRole) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Check cache first
      if (isCacheValid(cache.stats.timestamp) && cache.stats.data) {
        setStats(cache.stats.data);
        setLoading(false);
        return;
      }

      // Prevent duplicate fetch if already fetching
      if (fetchingFlags.stats) {
        // Wait for the ongoing fetch to complete
        const checkInterval = setInterval(() => {
          if (!fetchingFlags.stats && cache.stats.data) {
            setStats(cache.stats.data);
            setLoading(false);
            clearInterval(checkInterval);
          }
        }, 100);
        return;
      }

      fetchingFlags.stats = true;

      try {
        const statsRes = await generalAPI.getDashboardStats();
        const data = statsRes?.data?.responseData || {};
        
        // Update cache
        cache.stats = {
          data,
          timestamp: Date.now()
        };
        
        if (mountedRef.current) {
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetch dashboard stats:", err);
        if (mountedRef.current) {
          setError(err);
        }
      } finally {
        fetchingFlags.stats = false;
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mountedRef.current = false;
    };
  }, []); // Empty dependency array

  return { stats, loading, error };
};

export const useWalasInfo = (userRole) => {
  const [walasInfo, setWalasInfo] = useState(null);
  const [walasStats, setWalasStats] = useState({ hadir: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0, total: 0 });
  const [walasPresentRate, setWalasPresentRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (userRole !== "walas") {
      setLoading(false);
      return;
    }

    const fetchInfo = async () => {
      // Check cache first
      if (isCacheValid(cache.walasInfo.timestamp) && cache.walasInfo.data) {
        const cached = cache.walasInfo.data;
        setWalasInfo(cached.info);
        setWalasStats(cached.stats);
        setWalasPresentRate(cached.presentRate);
        setLoading(false);
        return;
      }

      // Prevent duplicate fetch
      if (fetchingFlags.walasInfo) {
        const checkInterval = setInterval(() => {
          if (!fetchingFlags.walasInfo && cache.walasInfo.data) {
            const cached = cache.walasInfo.data;
            setWalasInfo(cached.info);
            setWalasStats(cached.stats);
            setWalasPresentRate(cached.presentRate);
            setLoading(false);
            clearInterval(checkInterval);
          }
        }, 100);
        return;
      }

      fetchingFlags.walasInfo = true;

      try {
        const res = await guruAPI.walasInfo();
        const data = res?.data?.responseData;

        const statsRes = await generalAPI.getDashboardStats();
        const stats = statsRes?.data?.responseData || {};
        
        const walasStatsData = {
          hadir: stats.hadir || 0,
          terlambat: stats.terlambat || 0,
          izin: stats.izin || 0,
          sakit: stats.sakit || 0,
          alfa: stats.alfa || 0,
          total: stats.total_siswa || 0
        };

        // Update cache
        cache.walasInfo = {
          data: {
            info: data,
            stats: walasStatsData,
            presentRate: stats.present_rate || 0
          },
          timestamp: Date.now()
        };
        
        if (mountedRef.current) {
          setWalasInfo(data);
          setWalasStats(walasStatsData);
          setWalasPresentRate(stats.present_rate || 0);
        }
      } catch {
        if (mountedRef.current) {
          setWalasInfo(null);
          setWalasStats({ hadir: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0, total: 0 });
          setWalasPresentRate(0);
        }
      } finally {
        fetchingFlags.walasInfo = false;
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchInfo();

    return () => {
      mountedRef.current = false;
    };
  }, []); // Empty dependency array

  return { walasInfo, walasStats, walasPresentRate, loading };
};

export const useAdminTrendData = (userRole) => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (userRole !== "admin") {
      setLoading(false);
      return;
    }

    const fetchTrend = async () => {
      // Check cache first
      if (isCacheValid(cache.trendData.timestamp) && cache.trendData.data) {
        setTrendData(cache.trendData.data);
        setLoading(false);
        return;
      }

      // Prevent duplicate fetch
      if (fetchingFlags.trendData) {
        const checkInterval = setInterval(() => {
          if (!fetchingFlags.trendData && cache.trendData.data) {
            setTrendData(cache.trendData.data);
            setLoading(false);
            clearInterval(checkInterval);
          }
        }, 100);
        return;
      }

      fetchingFlags.trendData = true;

      try {
        const today = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        const days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(today.getDate() - (6 - i));
          return d;
        });

        const results = await Promise.all(
          days.map((d) => 
            adminAPI.rekap({ tanggal: fmt(d) })
              .then((r) => ({ d, data: r?.data?.rekap || [] }))
              .catch(() => ({ d, data: [] }))
          )
        );

        const trend = results.map(({ d, data }) => {
          const agg = data.reduce(
            (acc, k) => {
              acc.hadir += Number(k.hadir);
              acc.terlambat += Number(k.terlambat);
              acc.izin += Number(k.izin);
              acc.sakit += Number(k.sakit);
              acc.alfa += Number(k.alfa);
              return acc;
            },
            { hadir: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0 }
          );
          const total = agg.hadir + agg.terlambat + agg.izin + agg.sakit + agg.alfa;
          const rate = total > 0 ? Math.round((agg.hadir / total) * 100) : 0;
          return { label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`, rate };
        });

        // Update cache
        cache.trendData = {
          data: trend,
          timestamp: Date.now()
        };

        if (mountedRef.current) {
          setTrendData(trend);
        }
      } catch {
        if (mountedRef.current) {
          setTrendData([]);
        }
      } finally {
        fetchingFlags.trendData = false;
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchTrend();

    return () => {
      mountedRef.current = false;
    };
  }, []); // Empty dependency array

  return { trendData, loading };
};

export const useAktivitas = (userRole) => {
  const [aktivitas, setAktivitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (userRole === "admin" || (userRole !== "gurket" && userRole !== "walas")) {
      setLoading(false);
      return;
    }

    const fetchAktivitas = async () => {
      // Check cache first
      if (isCacheValid(cache.aktivitas.timestamp) && cache.aktivitas.data) {
        setAktivitas(cache.aktivitas.data);
        setLoading(false);
        return;
      }

      // Prevent duplicate fetch
      if (fetchingFlags.aktivitas) {
        const checkInterval = setInterval(() => {
          if (!fetchingFlags.aktivitas && cache.aktivitas.data) {
            setAktivitas(cache.aktivitas.data);
            setLoading(false);
            clearInterval(checkInterval);
          }
        }, 100);
        return;
      }

      fetchingFlags.aktivitas = true;

      try {
        const response = await guruAPI.aktifitasTerbaru();
        if (response.data.responseStatus) {
          const data = response.data.responseData || [];
          
          // Update cache
          cache.aktivitas = {
            data,
            timestamp: Date.now()
          };
          
          if (mountedRef.current) {
            setAktivitas(data);
          }
        }
      } catch (error) {
        console.error("Gagal memuat aktivitas:", error);
      } finally {
        fetchingFlags.aktivitas = false;
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchAktivitas();

    // Refresh every 60 seconds
    const interval = setInterval(() => {
      fetchAktivitas();
    }, 60000);

    return () => {
      clearInterval(interval);
      mountedRef.current = false;
    };
  }, []); // Empty dependency array

  return { aktivitas, loading };
};
