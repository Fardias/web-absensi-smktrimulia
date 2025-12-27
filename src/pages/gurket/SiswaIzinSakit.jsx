import React, { useEffect, useState } from "react";
import api, { guruAPI } from "../../services/api";
import { Loading } from "../../components";
import Swal from "sweetalert2";

export default function SiswaIzinSakit() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [filterType, setFilterType] = useState('all'); // 'all', 'izin', 'sakit'

    useEffect(() => {
        fetchList();
    }, []);

    async function fetchList() {
        setLoading(true);
        setError(null);
        try {
            const res = await guruAPI.getSiswaIzinSakit();
            const list = res?.data?.responseData?.siswa_izin_sakit ?? [];
            console.log("Siswa Izin Sakit:", list);

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

        // Jika path sudah full URL (misal dari Cloudinary/S3), langsung return
        if (buktiPath.startsWith("http")) return buktiPath;

        // Ambil base URL API (biasanya http://localhost:8000/api)
        let baseURL = api.defaults.baseURL || window.location.origin;

        // Hapus '/api' di akhir jika ada, karena storage biasanya di root level (http://localhost:8000/storage/...)
        baseURL = baseURL.replace(/\/api\/?$/, "");

        // Pastikan path dimulai dengan 'storage/'
        // Jika di database tersimpan sebagai "izin_sakit/file.png", kita perlu tambahkan "storage/"
        const cleanPath = buktiPath.replace(/^\/+/, ""); // Hapus slash di depan jika ada
        const finalPath = cleanPath.startsWith("storage") ? cleanPath : `storage/${cleanPath}`;

        return `${baseURL}/${finalPath}`;
    }

    // 🔧 Perbaikan: updateStatus kirim absensi_id lewat body (bukan URL)
    async function updateStatus(absensiId, newStatus) {
        let confirmTitle = "";
        let confirmText = "";
        let confirmButtonText = "";
        let confirmButtonColor = "";

        switch (newStatus) {
            case "sakit":
                confirmTitle = "Tandai Sakit?";
                confirmText = "Siswa akan ditandai sebagai Sakit.";
                confirmButtonText = "Ya, Tandai Sakit";
                confirmButtonColor = "#EF4444"; // red-500
                break;
            case "izin":
                confirmTitle = "Tandai Izin?";
                confirmText = "Siswa akan ditandai sebagai Izin.";
                confirmButtonText = "Ya, Tandai Izin";
                confirmButtonColor = "#3B82F6"; // blue-500
                break;
            case "alfa": // Menggunakan 'alfa' untuk tolak sesuai request sebelumnya
                confirmTitle = "Tolak Pengajuan?";
                confirmText = "Pengajuan akan ditolak dan status menjadi Alfa.";
                confirmButtonText = "Ya, Tolak";
                confirmButtonColor = "#4B5563"; // gray-600
                break;
            default:
                confirmTitle = "Konfirmasi Update";
                confirmText = `Ubah status menjadi ${newStatus}?`;
                confirmButtonText = "Ya, Update";
                confirmButtonColor = "#3085d6";
        }

        const result = await Swal.fire({
            title: confirmTitle,
            text: confirmText,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: confirmButtonColor,
            cancelButtonColor: "#d33",
            confirmButtonText: confirmButtonText,
            cancelButtonText: "Batal",
        });

        if (!result.isConfirmed) return;

        setUpdatingId(absensiId);
        try {
            await guruAPI.updateAbsensiStatus({
                absensi_id: absensiId,
                status: newStatus,
            });

            setItems((prev) =>
                prev.filter((it) => it.absensi_id !== absensiId)
            );

            Swal.fire({
                title: "Berhasil!",
                text: "Status berhasil diperbarui.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: "Gagal!",
                text: "Gagal memperbarui status. Periksa konfigurasi API atau jaringan.",
                icon: "error",
            });
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

    const filteredItems = items.filter((it) => {
        if (filterType === "all") return true;
        return it.status === filterType;
    });

    return (
        <div className="flex flex-col p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Daftar Siswa Izin / Sakit
                </h2>

                {/* Filter Buttons */}
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filterType === 'all'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setFilterType('izin')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filterType === 'izin'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Izin
                    </button>
                    <button
                        onClick={() => setFilterType('sakit')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filterType === 'sakit'
                            ? 'bg-white text-red-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Sakit
                    </button>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="p-6 text-gray-600 text-center">
                    {filterType === 'all'
                        ? 'Tidak ada pengajuan izin atau sakit yang perlu diverifikasi.'
                        : `Tidak ada pengajuan ${filterType} saat ini.`}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((it) => {
                        const img = getImageUrl(it.bukti);
                        // console.log("img", img);

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
                                <div className="flex items-center justify-center w-full h-48 overflow-hidden bg-gray-200 cursor-pointer" onClick={() => img && setPreviewImage(img)}>
                                    {img ? (
                                        <img
                                            src={img}
                                            alt={`bukti-${it.absensi_id}`}
                                            className="object-cover w-full h-full transition-transform hover:scale-105"
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
                                                NIS {siswa.nis ?? "—"} - Kelas:{" "}
                                                {siswa.kelas
                                                    ? `${siswa.kelas.tingkat ?? ""} ${siswa.kelas.jurusan?.nama_jurusan ?? ""} ${siswa.kelas.paralel ?? ""}`
                                                    : "—"}
                                            </div>

                                            <div>
                                                Keterangan: {it.keterangan ?? "—"}
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
                                        {/* Tombol hanya muncul jika status saat ini bukan "sakit" */}
                                        {it.status == "sakit" && (
                                            <button
                                                onClick={() => updateStatus(it.absensi_id, "sakit")}
                                                disabled={isUpdating}
                                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
                                                        ${isUpdating
                                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                        : "bg-red-500 text-white hover:bg-red-600"
                                                    }`}
                                            >
                                                Tandai Sakit
                                            </button>
                                        )}

                                        {/* Tombol hanya muncul jika status saat ini bukan "izin" */}
                                        {it.status == "izin" && (
                                            <button
                                                onClick={() => updateStatus(it.absensi_id, "izin")}
                                                disabled={isUpdating}
                                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
                                                        ${isUpdating
                                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                                    }`}
                                            >
                                                Tandai Izin
                                            </button>
                                        )}

                                        <button
                                            onClick={() =>
                                                updateStatus(it.absensi_id, "alfa")
                                            }
                                            disabled={isUpdating || it.status === "alfa"}
                                            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
                                                    ${isUpdating || it.status === "alfa"
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

            {/* Modal Preview Image */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] p-2">
                        <button
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold"
                            onClick={() => setPreviewImage(null)}
                        >
                            &times;
                        </button>
                        <img
                            src={previewImage}
                            alt="Full Preview"
                            className="max-w-full max-h-[85vh] object-contain rounded-md"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
