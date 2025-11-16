// Dashboard.jsx
import { useAuth } from "../contexts/AuthContext";
import { Header, Loading, SideBar } from "../components";
import { formatDate } from "../utils";
import { useState, useEffect } from "react";
import { useDataSiswa } from "../hooks/useDataSiswa";
import { useCountUp } from "../hooks";
import { guruAPI, adminAPI } from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();

  const [totalSiswa, setTotalSiswa] = useState(0);
  const [hadirHariIni, setHadirHariIni] = useState(0);
  const [terlambat, setTerlambat] = useState(0);
  const [izin, setIzin] = useState(0);
  const [sakit, setSakit] = useState(0);

  const [aktivitas, setAktivitas] = useState([]);
  const [loadingAktivitas, setLoadingAktivitas] = useState(true);
  const [presentRate, setPresentRate] = useState(0);
  const [globalStats, setGlobalStats] = useState({ hadir: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0, total: 0 });
  const [trendData, setTrendData] = useState([]);

  // Walas info & filter daftar siswa hari ini
  const [walasInfo, setWalasInfo] = useState(null);
  const [filterStatus, setFilterStatus] = useState("hadir");
  const [listLoading, setListLoading] = useState(false);
  const [siswaList, setSiswaList] = useState([]);

  const animTotalSiswa = useCountUp(totalSiswa, 500);
  const animHadir = useCountUp(hadirHariIni, 500);
  const animTerlambat = useCountUp(terlambat, 500);
  const animIzin = useCountUp(izin, 500);
  const animSakit = useCountUp(sakit, 500);

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
        const [cTotalSiswa, cHadirHariIni, cTerlambat, cIzin, cSakit] =
          await Promise.all([
            handleTotalSiswa(),
            handleSiswaHadirHariIni(),
            handleSiswaTerlambat(),
            handleSiswaIzinHariIni(),
            handleSiswaSakitHariIni(),
          ]);

        setTotalSiswa(cTotalSiswa || 0);
        setHadirHariIni(cHadirHariIni || 0);
        setTerlambat(cTerlambat || 0);
        setIzin(cIzin || 0);
        setSakit(cSakit || 0);
        if (user?.role === "gurket") {
          const total = Number(cTotalSiswa || 0);
          const hadir = Number(cHadirHariIni || 0);
          const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;
          setPresentRate(rate);
        }
      } catch (err) {
        console.error("Error fetch dashboard data:", err);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch walas info jika role walas
  useEffect(() => {
    const fetchInfo = async () => {
      if (user?.role !== "walas") return;
      try {
        const res = await guruAPI.walasInfo();
        const data = res?.data?.responseData || res?.data?.data || null;
        setWalasInfo(data);
      } catch (e) {
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
            acc.hadir += Number(k.hadir || 0);
            acc.terlambat += Number(k.terlambat || 0);
            acc.izin += Number(k.izin || 0);
            acc.sakit += Number(k.sakit || 0);
            acc.alfa += Number(k.alfa || 0);
            return acc;
          },
          { hadir: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0 }
        );
        const totalAll = totals.hadir + totals.terlambat + totals.izin + totals.sakit + totals.alfa;
        setGlobalStats({ ...totals, total: totalAll });

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
              acc.hadir += Number(k.hadir || 0);
              acc.terlambat += Number(k.terlambat || 0);
              acc.izin += Number(k.izin || 0);
              acc.sakit += Number(k.sakit || 0);
              acc.alfa += Number(k.alfa || 0);
              return acc;
            },
            { hadir: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0 }
          );
          const total = agg.hadir + agg.terlambat + agg.izin + agg.sakit + agg.alfa;
          const rate = total > 0 ? Math.round((agg.hadir / total) * 100) : 0;
          return { label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`, rate };
        });
        setTrendData(trend);
      } catch (e) {
        setGlobalStats({ hadir: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0, total: 0 });
        setTrendData([]);
      }
    };
    fetchAdminGlobal();
  }, [user?.role]);

  // Fetch daftar siswa hari ini berdasarkan status
  const fetchSiswaByStatus = async (status) => {
    setListLoading(true);
    try {
      const res = await guruAPI.lihatAbsensiSiswa({ status });
      const payload = res?.data?.responseData || res?.data || {};
      const list = payload?.absensi || [];
      setSiswaList(Array.isArray(list) ? list : []);
    } catch (e) {
      setSiswaList([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    // auto load list untuk status awal
    fetchSiswaByStatus(filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "admin":
        return "Kepala Sekolah (Administrator)";
      case "gurket":
        return "Guru Piket";
      case "walas":
        return "Wali Kelas";
      default:
        return role;
    }
  };

  useEffect(() => {
    const fetchAktivitas = async () => {
      try {
        const response = await guruAPI.aktifitasTerbaru();
        if (response.data.responseStatus) {
          setAktivitas(response.data.responseData || []);
        } else {
          console.error(
            "Gagal ambil aktivitas:",
            response.data.responseMessage
          );
        }
      } catch (error) {
        console.error("Gagal memuat aktivitas:", error);
      } finally {
        setLoadingAktivitas(false);
      }
    };

    fetchAktivitas();

    // Polling otomatis setiap 5 detik
    const interval = setInterval(fetchAktivitas, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return <Loading text="Memuat data user..." />;
  }

  if (loading) {
    return <Loading text="Loading..." />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col flex-1 ">
        {/* Main Content */}
        <main className="px-4 py-8 max-w-7xl sm:px-6 lg:px-14">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Selamat datang, {user.username}!
            </h2>
            <p className="text-gray-600">
              Dashboard {getRoleDisplayName(user.role)} -{" "}
              {formatDate(new Date())}
            </p>
          </div>
          {user.role === "gurket" && (
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center">
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-3.866 0-7 3.134-7 7h2a5 5 0 015-5V8z" />
                    </svg>
                  </div>
                  <div className="ml-4 ">
                    <p className="text-sm font-medium text-gray-600">Persentase Kehadiran</p>
                    <p className="text-2xl font-bold text-gray-900">{presentRate}%</p>
                    <div className="mt-2 h-2 bg-gray-200 rounded">
                      <div className="h-2 bg-teal-500 rounded" style={{ width: `${presentRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
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
              </div>
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Tren Kehadiran 7 Hari</h3>
                <div className="w-full h-36">
                  {trendData.length === 0 ? (
                    <div className="text-sm text-gray-500">Tidak ada data tren.</div>
                  ) : (
                    <svg viewBox="0 0 300 120" className="w-full h-full">
                      {(() => {
                        const maxY = 100;
                        const pts = trendData.map((t, i) => {
                          const x = (i / (trendData.length - 1)) * 280 + 10;
                          const y = 110 - (t.rate / maxY) * 100;
                          return `${x},${y}`;
                        }).join(" ");
                        return (
                          <g>
                            <polyline fill="none" stroke="#0ea5e9" strokeWidth="2" points={pts} />
                            {trendData.map((t, i) => {
                              const x = (i / (trendData.length - 1)) * 280 + 10;
                              const y = 110 - (t.rate / maxY) * 100;
                              return <circle key={i} cx={x} cy={y} r="3" fill="#0ea5e9" />;
                            })}
                          </g>
                        );
                      })()}
                      {trendData.map((t, i) => (
                        <text key={i} x={(i / (trendData.length - 1)) * 280 + 10} y={118} fontSize="8" textAnchor="middle" fill="#6b7280">{t.label}</text>
                      ))}
                    </svg>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Aktivitas Terbaru */}
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
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setFilterStatus(opt.key)}
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
                <p className="text-sm text-gray-500">Tidak ada data untuk status ini.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">NIS</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Kelas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Jam Datang</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Jam Pulang</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {siswaList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{row.nis || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{row.nama || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {row.tingkat ? `Kelas ${row.tingkat} ${row.jurusan || ''} ${row.paralel || ''}` : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 capitalize">{row.status || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{row.jam_datang || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{row.jam_pulang || '-'}</td>
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
