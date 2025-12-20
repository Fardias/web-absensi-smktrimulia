import { useState } from "react";
import { CloudUpload, CheckCircle, XCircle, Download, Eye, FileSpreadsheet, FileText } from "lucide-react";
import { adminAPI } from "../../services/api";

const ImportSiswa = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Template data with preview images and download links
    const templates = [
        {
            id: 'excel',
            name: 'Template Excel (.xls)',
            description: '',
            icon: FileSpreadsheet,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            previewImage: '/images/preview.png',
            downloadUrl: '/templates/template-siswa.xls',
            format: '.xls'
        }
    ];

    const handleTemplatePreview = (template) => {
        setSelectedTemplate(template);
        setShowPreview(true);
    };

    const handleDownloadTemplate = async (template) => {
        try {
            // For Excel, download the static file
            const link = document.createElement('a');
            link.href = template.downloadUrl;
            link.download = `template-siswa${template.format}`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading template:', error);
            alert('Terjadi kesalahan saat mendownload template. Silakan coba lagi.');
        }
    };

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
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#003366] mb-2">
                    Import Data Siswa
                </h1>
                <p className="text-gray-500">Upload file Excel (.xlsx / .xls) sesuai dengan template yang disediakan</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Template Section */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Template File</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Pilih dan download template sesuai format yang Anda inginkan. Pastikan data mengikuti format yang benar.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {templates.map((template) => {
                            const IconComponent = template.icon;
                            return (
                                <div
                                    key={template.id}
                                    className={`p-4 rounded-xl border-2 ${template.borderColor} ${template.bgColor} hover:shadow-md transition-all duration-200`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <div className={`p-2 rounded-lg bg-white`}>
                                                <IconComponent className={`w-6 h-6 ${template.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                                
                                                {/* Format Info */}
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Format: {template.format}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 mt-4">
                                        <button
                                            onClick={() => handleTemplatePreview(template)}
                                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => handleDownloadTemplate(template)}
                                            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Format Requirements */}
                    {/* <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <h4 className="font-semibold text-yellow-800 mb-2">Persyaratan Format:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Kolom wajib: NIS, Nama, Jenis Kelamin (L/P), Kelas</li>
                            <li>• NIS harus berupa angka dan unik</li>
                            <li>• Nama tidak boleh kosong</li>
                            <li>• Jenis Kelamin: L (Laki-laki) atau P (Perempuan)</li>
                            <li>• Kelas harus sesuai dengan kelas yang ada di sistem</li>
                            <li>• File harus dalam format Excel (.xls atau .xlsx)</li>
                        </ul>
                    </div> */}
                </div>

                {/* Upload Section */}
                <div className="flex justify-center">
                    <div className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
                        <div className="flex flex-col items-center mb-6">
                            <div className="p-4 bg-[#003366]/10 rounded-full">
                                <CloudUpload className="w-10 h-10 text-[#003366]" />
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-center text-gray-900">
                                Upload File
                            </h2>
                            <p className="mt-1 text-sm text-center text-gray-500">
                                Pilih file yang sudah sesuai template
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#003366] rounded-xl p-6 cursor-pointer transition">
                                <input
                                    id="file"
                                    type="file"
                                    accept=".xlsx, .xls"
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
            </div>

            {/* Preview Modal */}
            {showPreview && selectedTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Preview: {selectedTemplate.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedTemplate.description}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Template Preview Image */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Preview Template:</h4>
                                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                    <div className="flex items-center justify-center p-4">
                                        <img 
                                            src={selectedTemplate.previewImage} 
                                            alt={`Preview ${selectedTemplate.name}`}
                                            className="max-w-full h-auto rounded shadow-sm"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <div 
                                            className="hidden text-center p-8 text-gray-500"
                                        >
                                            <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                            <p>Preview gambar tidak tersedia</p>
                                            <p className="text-sm mt-2">Silakan download template untuk melihat format yang benar</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Petunjuk Penggunaan:</h4>
                                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                        <li>Download template dengan klik tombol "Download"</li>
                                        <li>Buka file template dengan aplikasi spreadsheet (Excel, LibreOffice, dll)</li>
                                        <li>Isi data siswa sesuai dengan kolom yang tersedia</li>
                                        <li>Pastikan format data sesuai dengan ketentuan</li>
                                        <li>Simpan file dan upload melalui form di sebelah kanan</li>
                                    </ol>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h5 className="font-semibold text-blue-800 mb-2">Catatan Penting:</h5>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Jangan mengubah nama kolom header</li>
                                        <li>• Pastikan tidak ada baris kosong di tengah data</li>
                                        <li>• NIS harus unik (tidak boleh sama)</li>
                                        <li>• Kelas harus sudah terdaftar di sistem</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => {
                                    handleDownloadTemplate(selectedTemplate);
                                    setShowPreview(false);
                                }}
                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#003366] rounded-lg hover:bg-[#002244] transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportSiswa;
