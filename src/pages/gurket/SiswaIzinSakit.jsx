import React, { useEffect, useState } from "react";
import { guruAPI } from "../../services/api";
import { Loading } from "../../components";

export default function SiswaIzinSakit() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchList();
    }, []);

    async function fetchList() {
        setLoading(true);
        setError(null);
        try {
            const res = await guruAPI.getSiswaIzinSakit();
            const list = res?.data?.responseData?.siswa_izin_sakit ?? [];
            setItems(list);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat data. Periksa koneksi atau konfigurasi API.");
        } finally {
            setLoading(false);
        }
    }

    function getImageUrl(buktiPath) {
        if (!buktiPath) return null;
        const baseURL =
            guruAPI?.apiInstance?.defaults?.baseURL || window.location.origin;
        if (buktiPath.startsWith("http")) return buktiPath;
        return `${baseURL.replace(/\/+$/, "")}/${buktiPath.replace(/^\/+/, "")}`;
    }

    // 🔧 Perbaikan: updateStatus kirim absensi_id lewat body (bukan URL)
    async function updateStatus(absensiId, newStatus) {
        const confirmed = window.confirm(
            `Yakin ingin mengubah status menjadi "${newStatus}"?`
        );
        if (!confirmed) return;

        setUpdatingId(absensiId);
        try {
            await guruAPI.updateAbsensiStatus({
                absensi_id: absensiId,
                status: newStatus,
            });

            setItems((prev) =>
                prev.map((it) =>
                    it.absensi_id === absensiId ? { ...it, status: newStatus } : it
                )
            );

            alert("Status berhasil diperbarui.");
        } catch (err) {
            console.error(err);
            alert("Gagal memperbarui status. Periksa konfigurasi API atau jaringan.");
        } finally {
            setUpdatingId(null);
        }
    }

    if (loading) return <Loading text="Memuat data user..." />;
    if (error)
        return (
            <div className="p-5 text-red-600">
                Error: {error}
                <div className="mt-2">
                    <button
                        onClick={fetchList}
                        className="px-4 py-2 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Coba lagi
                    </button>
                </div>
            </div>
        );

    return (
        <div className="flex flex-col p-6 md:p-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-800">
                    Daftar Siswa Izin / Sakit
                </h2>

                {items.length === 0 ? (
                    <div className="p-6 text-gray-600 bg-white rounded-lg shadow-md">
                        Tidak ada pengajuan izin atau sakit saat ini.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((it) => {
                            const img = getImageUrl(it.bukti);
                            const siswa = it.siswa ?? {};
                            const isUpdating = updatingId === it.absensi_id;

                            let statusClasses = "";
                            let statusTextClass = "";
                            switch (it.status) {
                                case "pending":
                                    statusClasses = "bg-yellow-100";
                                    statusTextClass = "text-yellow-800";
                                    break;
                                case "sakit":
                                    statusClasses = "bg-red-100";
                                    statusTextClass = "text-red-800";
                                    break;
                                case "izin":
                                    statusClasses = "bg-green-100";
                                    statusTextClass = "text-green-800";
                                    break;
                                case "rejected":
                                    statusClasses = "bg-gray-200";
                                    statusTextClass = "text-gray-600";
                                    break;
                                default:
                                    statusClasses = "bg-gray-200";
                                    statusTextClass = "text-gray-700";
                            }

                            const jenis = String(it.jenis_absen ?? "").toLowerCase();
                            const cardBgClass =
                                jenis === "sakit"
                                    ? "bg-red-50 border-red-300"
                                    : jenis === "izin"
                                    ? "bg-blue-50 border-blue-300"
                                    : "bg-white border-gray-100";
                            const jenisTextClass =
                                jenis === "sakit"
                                    ? "text-red-700"
                                    : jenis === "izin"
                                    ? "text-blue-700"
                                    : "text-gray-700";

                            return (
                                <div
                                    key={it.absensi_id}
                                    className={`flex flex-col overflow-hidden transition-all duration-200 shadow-lg rounded-xl hover:shadow-xl border-l-4 ${cardBgClass}`}
                                >
                                    {/* Gambar bukti */}
                                    <div className="flex items-center justify-center w-full h-48 overflow-hidden bg-gray-200">
                                        {img ? (
                                            <img
                                                src={img}
                                                alt={`bukti-${it.absensi_id}`}
                                                className="object-cover w-full h-full"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                    e.currentTarget.parentElement.innerHTML =
                                                        '<div class="text-gray-500 text-sm">Gagal memuat bukti</div>';
                                                }}
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-500">Tidak ada bukti</div>
                                        )}
                                    </div>

                                    <div className="flex flex-col flex-grow p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                {/* <div>
                                                    <span className={`text-sm font-medium ${jenisTextClass}`}>
                                                        {String(it.jenis_absen ?? "—").toUpperCase()}
                                                    </span>
                                                </div> */}
                                                <div className="text-lg font-semibold leading-tight text-gray-900">
                                                    {siswa.nama ?? "—"}
                                                </div>
                                                <div className="mt-1 text-sm text-gray-500">
                                                    NIS: {siswa.nis ?? "—"} • Kelas:{" "}
                                                    {siswa.kelas_id ?? "—"}
                                                </div>
                                                {/* <div className="mt-2 text-sm text-gray-600">
                                                    Tanggal: {it.tanggal ?? "—"}
                                                </div> */}
                                            </div>

                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusClasses} ${statusTextClass}`}
                                            >
                                                {it.status ?? "—"}
                                            </span>
                                        </div>

                                        <div className="pt-3 mt-auto text-xs text-gray-500 border-t border-gray-100">
                                            Diajukan:{" "}
                                            {new Date(
                                                it.created_at ?? it.tanggal
                                            ).toLocaleString()}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-4">
                                            <button
                                                onClick={() => updateStatus(it.absensi_id, "sakit")}
                                                disabled={isUpdating || it.status === "sakit"}
                                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
                                                    ${isUpdating || it.status === "sakit"
                                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                        : "bg-red-500 text-white hover:bg-red-600"
                                                    }`}
                                            >
                                                Tandai Sakit
                                            </button>

                                            <button
                                                onClick={() => updateStatus(it.absensi_id, "izin")}
                                                disabled={isUpdating || it.status === "izin"}
                                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
                                                    ${isUpdating || it.status === "izin"
                                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                                    }`}
                                            >
                                                Tandai Izin
                                            </button>

                                            <button
                                                onClick={() =>
                                                    updateStatus(it.absensi_id, "rejected")
                                                }
                                                disabled={isUpdating || it.status === "rejected"}
                                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
                                                    ${isUpdating || it.status === "rejected"
                                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                        : "bg-gray-600 text-white hover:bg-gray-700"
                                                    }`}
                                            >
                                                Tolak
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
        </div>
    );
}
