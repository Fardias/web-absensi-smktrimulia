import { useAuth } from "../contexts/AuthContext";
import { Loading } from "../components";
import { formatDate } from "../utils";
import { useState, useEffect } from "react";
import { useDataSiswa } from "../hooks/useDataSiswa";
import { useCountUp } from "../hooks";
import { guruAPI, adminAPI } from "../services/api";
import { AttendancePieChart, AttendanceTrendChart } from "../components/AttendanceChart";
import { DashboardSkeleton, CardSkeleton } from "../components/LoadingSkeleton";
import { handleApiError } from "../services/api";
import { useDashboardStats, useDashboardActivities, useDashboardTrends } from "../hooks/useQueries";
import Swal from 'sweetalert2';

const Dashboard = () => {
  const { user } = useAuth();

  const [totalSiswa, setTotalSiswa] = useState(0);
  const [hadirHariIni, setHadirHariIni] = useState(0);
  const [terlambat, setTerlambat] = useState(0);
  const [izin, setIzin] = useState(0);
  const [sakit, setSakit] = useState(0);
  const [alfa, setAlfa] = useState(0);
  const [belumHadir, setBelumHadir] = useState(0);

  const [aktivitas, setAktivitas] = useState([]);
  const [loadingAktivitas, setLoadingAktivitas] = useState(true);
  const [presentRate, setPresentRate] = useState(0);
  // const [globalStats, setGlobalStats] = useState({ hadir: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0, total: 0 });
  const [trendData, setTrendData] = useState([]);

  // Walas info & filter daftar siswa hari ini
  const [walasInfo, setWalasInfo] = useState(null);
  const [filterStatus, setFilterStatus] = useState("hadir");
  const [listLoading, setListLoading] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState({});

  const animTotalSiswa = useCountUp(totalSiswa, 500);
  const animHadir = useCountUp(hadirHariIni, 500);
  const animTerlambat = useCountUp(terlambat, 500);
  const animIzin = useCountUp(izin, 500);
  const animSakit = useCountUp(sakit, 500);
  const animAlfa = useCountUp(alfa, 500);
  const animBelumHadir = useCountUp(belumHadir, 500);

  const {
    handleTotalSiswa,
    handleSiswaHadirHariIni,
    handleSiswaTerlambat,
    handleSiswaIzinHariIni,
    handleSiswaSakitHariIni,
    loading,
    error,
  } = useDataSiswa();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const userRole = user?.role?.toLowerCase();
        console.log("✨✨✨✨userRole:", userRole);

        const [cTotalSiswa, cHadirHariIni, cTerlambat, cIzin, cSakit, absensiRes] =
          await Promise.all([
            handleTotalSiswa(),
            handleSiswaHadirHariIni(),
            handleSiswaTerlambat(),
            handleSiswaIzinHariIni(),
            handleSiswaSakitHariIni(),
            userRole === 'gurket' || userRole === 'walas' || userRole === 'admin'
              ? guruAPI.lihatAbsensiSiswa({ tanggal: today }).catch(() => null)
              : Promise.resolve(null),
          ]);

        setTotalSiswa(cTotalSiswa);
        setHadirHariIni(cHadirHariIni);
        setTerlambat(cTerlambat);
        setIzin(cIzin);
        setSakit(cSakit);

        const total = Number(cTotalSiswa);
        const hadir = Number(cHadirHariIni);
        const terlambatNum = Number(cTerlambat);
        const absensiList = absensiRes?.data?.responseData?.absensi ?? [];
        // console.log("✨✨✨✨absensiList:", absensiList);

        const alfaCount = Array.isArray(absensiList)
          ? absensiList.reduce((acc, item) => {
            const status = String(item.status).toLowerCase();
            return status === "alfa" ? acc + 1 : acc;
          }, 0)
          : 0;
        setAlfa(alfaCount);

        const belumHadirNum = total - hadir - terlambatNum;
        setBelumHadir(belumHadirNum);

        if (user?.role === "gurket" || user?.role === "admin") {
          const rate = Math.round((hadir / total) * 100);
          setPresentRate(rate || 0);
        }
      } catch (err) {
        console.error("Error fetch dashboard data:", err);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: 'warning',
        title: error
      });
    }
  }, [error]);

  // Fetch walas info jika role walas
  useEffect(() => {
    const fetchInfo = async () => {
      if (user?.role !== "walas") return;
      try {
        const res = await guruAPI.walasInfo();
        const data = res?.data?.responseData;
        console.log(data);
        setWalasInfo(data);
      } catch {
        // silently fail
        setWalasInfo(null);
      }
    };
    fetchInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    const fetchAdminGlobal = async () => {
      if (user?.role !== "admin") return;
      try {
        const today = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        const resToday = await adminAPI.rekap({ tanggal: fmt(today) });
        const list = resToday?.data?.rekap || [];
        const totals = list.reduce(
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

        // const totalAll = totals.hadir + totals.terlambat + totals.izin + totals.sakit + totals.alfa;
        // setGlobalStats({ ...totals, total: totalAll });

        const days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(today.getDate() - (6 - i));
          return d;
        });
        const results = await Promise.all(
          days.map((d) => adminAPI.rekap({ tanggal: fmt(d) }).then((r) => ({ d, data: r?.data?.rekap || [] })).catch(() => ({ d, data: [] })))
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
        setTrendData(trend);
      } catch {
        setGlobalStats({ hadir: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0, total: 0 });
        setTrendData([]);
      }
    };
    fetchAdminGlobal();
  }, [user?.role]);

  // Fetch daftar siswa hari ini berdasarkan status
  const fetchSiswaByStatus = async (status) => {
    // Only fetch for supported statuses
    const supportedStatuses = ["hadir", "terlambat", "izin", "sakit"];

    // Only fetch for supported statuses and authorized roles
    const userRole = user?.role?.toLowerCase();
    if (!supportedStatuses.includes(status) || (userRole !== "gurket" && userRole !== "walas")) {
      setSiswaList([]);
      return;
    }

    setListLoading(true);
    try {
      const res = await guruAPI.lihatAbsensiSiswa({ status });
      const payload = res?.data?.responseData || res?.data || {};
      const list = payload?.absensi || [];
      setSiswaList(Array.isArray(list) ? list : []);
    } catch (error) {
      // console.error("Error fetching siswa by status:", error);
      setSiswaList([]);
    } finally {
      setListLoading(false);
    }
  };

  const handleStatusChange = async (absensiId, newStatus, oldStatus, siswaName) => {
    // Confirm the change
    const result = await Swal.fire({
      title: 'Konfirmasi Perubahan Status',
      html: `
        <div class="text-sm">
          <p><strong>Siswa:</strong> ${siswaName}</p>
          <p><strong>Status Lama:</strong> <span class="capitalize">${oldStatus}</span></p>
          <p><strong>Status Baru:</strong> <span class="capitalize">${newStatus}</span></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Ubah Status',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    // Set loading state for this specific row
    setUpdatingStatus(prev => ({ ...prev, [absensiId]: true }));

    try {
      await guruAPI.updateAbsensiStatusAll({
        absensi_id: absensiId,
        status: newStatus
      });

      // Update local state
      setSiswaList(prev => prev.map(item =>
        item.absensi_id === absensiId
          ? { ...item, status: newStatus }
          : item
      ));

      Swal.fire({
        icon: 'success',
        title: 'Status Berhasil Diubah!',
        text: `Status kehadiran ${siswaName} berhasil diubah menjadi ${newStatus}`,
        confirmButtonColor: '#3b82f6',
        timer: 3000,
        timerProgressBar: true
      });

    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengubah Status',
        text: error?.response?.data?.responseMessage || 'Terjadi kesalahan saat mengubah status',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [absensiId]: false }));
    }
  };

  const StatusDropdown = ({ item }) => {
    const statusOptions = [
      { value: 'hadir', label: 'Hadir', color: 'text-green-600' },
      { value: 'terlambat', label: 'Terlambat', color: 'text-yellow-600' },
      { value: 'izin', label: 'Izin', color: 'text-blue-600' },
      { value: 'sakit', label: 'Sakit', color: 'text-red-600' },
      { value: 'alfa', label: 'Alfa', color: 'text-gray-600' }
    ];

    const isUpdating = updatingStatus[item.absensi_id];

    return (
      <div className="relative">
        <select
          value={item.status}
          onChange={(e) => handleStatusChange(
            item.absensi_id,
            e.target.value,
            item.status,
            item.nama
          )}
          disabled={isUpdating}
          className={`
            w-full px-2 py-1 text-xs font-medium border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${isUpdating ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:bg-gray-50'}
            transition-colors duration-200
          `}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-md">
            <svg className="w-3 h-3 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    // auto load list untuk status awal
    fetchSiswaByStatus(filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "admin":
        return "Kepala Sekolah";
      case "gurket":
        return "Guru Piket";
      case "walas":
        return "Wali Kelas";
      default:
        return role;
    }
  };

  useEffect(() => {
    const userRole = user?.role?.toLowerCase();

    // Admin does not have access to aktivitas terbaru via guruAPI
    if (userRole === "admin") {
      setLoadingAktivitas(false);
      setAktivitas([]);
      return;
    }

    if (userRole !== "gurket" && userRole !== "walas") {
      setLoadingAktivitas(false);
      return;
    }

    const fetchAktivitas = async () => {
      try {
        const response = await guruAPI.aktifitasTerbaru();
        if (response.data.responseStatus) {
          setAktivitas(response.data.responseData || []);
        } else {
          // console.error("Gagal ambil aktivitas:", response.data.responseMessage);
        }
      } catch (error) {
        // console.error("Gagal memuat aktivitas:", error);
      } finally {
        setLoadingAktivitas(false);
      }
    };

    fetchAktivitas();

    const interval = setInterval(fetchAktivitas, 5000);
    return () => clearInterval(interval);
  }, [user?.role]);

  // Persentase Kehadiran
  const totalSiswaCard = Number(totalSiswa);
  const hadirSiswaHariIni = Number(hadirHariIni);
  const belumHadirs = Math.max(0, totalSiswaCard - hadirSiswaHariIni);

  if (!user) {
    return <Loading text="Memuat data user..." />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex flex-col flex-1">
          <main className="px-4 py-8 max-w-7xl sm:px-6 lg:px-14">
            <DashboardSkeleton />
          </main>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return <Error message={error} />;
  // }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col flex-1 ">
        {/* Main Content */}
        <main className="px-4 py-8 max-w-7xl sm:px-6 lg:px-14">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Selamat datang, {getRoleDisplayName(user.role)}👋
            </h2>
            <p className="text-gray-600">
              Dashboard {getRoleDisplayName(user.role)} -{" "}
              {formatDate(new Date())}
            </p>
          </div>
          {(user.role === "gurket" || user.role === "admin") && (
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
              <AttendancePieChart 
                hadirCount={hadirSiswaHariIni}
                belumHadirCount={belumHadirs}
                presentRate={presentRate}
              />
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            {/* Total Siswa */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Siswa
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {animTotalSiswa}
                  </p>
                </div>
              </div>
            </div>

            {/* Hadir Hari Ini */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Hadir
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {animHadir}
                  </p>
                </div>
              </div>
            </div>

            {/* Terlambat */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Terlambat</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {animTerlambat}
                  </p>
                </div>
              </div>
            </div>

            {/* Izin */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Izin</p>
                  <p className="text-2xl font-bold text-gray-900">{animIzin}</p>
                </div>
              </div>
            </div>

            {/* Sakit */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sakit</p>
                  <p className="text-2xl font-bold text-gray-900">{animSakit}</p>
                </div>
              </div>
            </div>

            {/* Alfa */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Alfa</p>
                  <p className="text-2xl font-bold text-gray-900">{animAlfa}</p>
                </div>
              </div>
            </div>

            {/* Belum Hadir */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Belum Hadir</p>
                  <p className="text-2xl font-bold text-gray-900">{animBelumHadir}</p>
                </div>
              </div>
            </div>
          </div>





          {/* Walas Info Card */}
          {user.role === "walas" && (
            <div className="mb-8">
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-8 8a6 6 0 0112 0v1H4v-1a6 6 0 014-6z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Status Wali Kelas</p>
                    <p className="text-base font-semibold text-gray-900">
                      {walasInfo?.kelas_label || "Memuat info kelas..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {user.role === "admin" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-8">
              {/* <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Statistik Absensi Global</h3>
                <div className="space-y-3 text-sm">
                  {[{ key: "Hadir", val: globalStats.hadir, color: "bg-green-500" }, { key: "Terlambat", val: globalStats.terlambat, color: "bg-yellow-500" }, { key: "Izin", val: globalStats.izin, color: "bg-blue-500" }, { key: "Sakit", val: globalStats.sakit, color: "bg-purple-500" }, { key: "Alfa", val: globalStats.alfa, color: "bg-red-500" }].map((it) => {
                    const pct = globalStats.total > 0 ? Math.round((it.val / globalStats.total) * 100) : 0;
                    return (
                      <div key={it.key} className="flex items-center gap-3">
                        <div className="w-20 text-gray-700">{it.key}</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded">
                          <div className={`h-2 ${it.color} rounded`} style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="w-16 text-right text-gray-900">{it.val}</div>
                      </div>
                    );
                  })}
                  <div className="mt-2 text-xs text-gray-500">Total: {globalStats.total}</div>
                </div>
              </div> */}
              <AttendanceTrendChart trendData={trendData} />
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Aktivitas Terbaru
                </h3>

                {loadingAktivitas ? (
                  <p className="text-sm text-gray-500">Memuat aktivitas...</p>
                ) : aktivitas.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Belum ada aktivitas terbaru.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {aktivitas.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 transition rounded-lg bg-gray-50 hover:bg-gray-100"
                      >
                        <div
                          className={`w-2 h-2 mr-3 rounded-full ${item.aksi === "created"
                            ? "bg-green-500"
                            : item.aksi === "updated"
                              ? "bg-yellow-500"
                              : item.aksi === "deleted"
                                ? "bg-red-500"
                                : "bg-gray-400"
                            }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {item.deskripsi}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID Akun: {item.akun_id || "-"} •{" "}
                            {new Date(item.created_at).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* {user.role === "admin" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              
            </div>
          )} */}

          {/* Filter & Tabel Daftar Siswa Hari Ini */}
          {user.role === "walas" && (
            <div className="mt-8 p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Daftar Siswa Hari Ini</h3>
                <div className="flex gap-2">
                  {[
                    { key: "hadir", label: "Hadir" },
                    { key: "terlambat", label: "Terlambat" },
                    { key: "izin", label: "Izin" },
                    { key: "sakit", label: "Sakit" },
                    { key: "alfa", label: "Alfa" },
                    { key: "belum_hadir", label: "Belum Hadir" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setFilterStatus(opt.key);
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm ${filterStatus === opt.key
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {listLoading ? (
                <p className="text-sm text-gray-500">Memuat data siswa...</p>
              ) : siswaList.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {["alfa", "belum_hadir"].includes(filterStatus)
                    ? `Fitur daftar siswa untuk status "${filterStatus.replace("_", " ")}" belum tersedia.`
                    : "Tidak ada data untuk status ini."
                  }
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-base">
                    <thead className="table-thead">
                      <tr>
                        <th className="table-th">NIS</th>
                        <th className="table-th">Nama</th>
                        <th className="table-th">Kelas</th>
                        <th className="table-th">Status</th>
                        <th className="table-th">Jam Datang</th>
                        <th className="table-th">Jam Pulang</th>
                      </tr>
                    </thead>
                    <tbody className="table-tbody">
                      {siswaList.map((row, idx) => (
                        <tr key={idx} className="table-tr hover:bg-gray-50">
                          <td className="table-td">{row.nis || '-'}</td>
                          <td className="table-td">{row.nama || '-'}</td>
                          <td className="table-td">
                            {row.tingkat ? `Kelas ${row.tingkat} ${row.jurusan || ''} ${row.paralel || ''}` : '-'}
                          </td>
                          <td className="table-td">
                            {row.absensi_id ? (
                              <StatusDropdown item={row} />
                            ) : (
                              <span className="capitalize text-gray-500">{row.status || '-'}</span>
                            )}
                          </td>
                          <td className="table-td">{row.jam_datang || '-'}</td>
                          <td className="table-td">{row.jam_pulang || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};


export default Dashboard;
