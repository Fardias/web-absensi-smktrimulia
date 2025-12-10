import { useState } from "react";
import { CloudUpload, CheckCircle, XCircle } from "lucide-react";
import { adminAPI } from "../../services/api";

const ImportSiswa = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage("");
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setMessage("Silakan pilih file terlebih dahulu.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            setProgress(0);
            setMessage("");
            setSuccess(false);

            const response = await adminAPI.importSiswa(formData, (event) => {
                const percent = Math.round((event.loaded * 100) / event.total);
                setProgress(percent);
            });

            if (response.status === 200) {
                setMessage("Data siswa berhasil diimpor!");
                setSuccess(true);
            } else {
                setMessage("Gagal mengimpor data siswa.");
                setSuccess(false);
            }
        } catch (err) {
            console.error(err);
            setMessage("Gagal mengunggah file.");
            setSuccess(false);
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 2000);
        }
    };

    return (
        <div className="p-8">
            {/* Main Content */}
                <h1 className="text-3xl font-bold text-[#003366] mb-2">
                    Import Data Siswa
                </h1>
                <p className="mb-8 text-gray-500">Upload file Excel (.xlsx / .xls / .csv)</p>

                <div className="relative w-full max-w-md p-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
                    <div className="flex flex-col items-center mb-6">
                        <div className="p-4 bg-[#003366]/10 rounded-full">
                            <CloudUpload className="w-10 h-10 text-[#003366]" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-center text-gray-900">
                            Import Data Siswa
                        </h2>
                        <p className="mt-1 text-sm text-center text-gray-500">
                            Pastikan format file sesuai template
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#003366] rounded-xl p-6 cursor-pointer transition">
                            <input
                                id="file"
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="file"
                                className="text-center text-gray-600 cursor-pointer"
                            >
                                {file ? (
                                    <>
                                        <p className="font-semibold text-[#003366]">{file.name}</p>
                                        <p className="text-xs text-gray-500">Klik untuk ganti file</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold text-gray-600">
                                            Klik untuk memilih file
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            atau drag & drop ke sini
                                        </p>
                                    </>
                                )}
                            </label>
                        </div>

                        {/* Progress Bar */}
                        {uploading && (
                            <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                                <div
                                    className="bg-[#003366] h-2 transition-all duration-700 ease-in-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={uploading}
                            className={`w-full py-2 font-medium text-white rounded-lg transition duration-200 shadow-md ${uploading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#003366] hover:bg-[#002244]"
                                }`}
                        >
                            {uploading ? "Mengunggah..." : "Import Sekarang"}
                        </button>
                    </form>

                    {/* Pesan hasil */}
                    {message && (
                        <div
                            className={`mt-6 flex items-center justify-center gap-2 text-sm font-medium text-center p-3 rounded-lg ${success
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                        >
                            {success ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                            {message}
                        </div>
                    )}
                </div>
        </div>
    );
};

export default ImportSiswa;
