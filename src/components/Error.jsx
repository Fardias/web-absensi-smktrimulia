
const Error = ({ message }) => {
  return (
    <div className="flex flex-col min-h-screen">
        <main className="flex items-center justify-center flex-grow">
          <div className="p-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            <h2 className="mb-2 text-lg font-semibold">Terjadi Kesalahan</h2>
            <p className="text-sm">{message ?? "Gagal memuat data. Silakan coba lagi nanti."}</p>
          </div>
        </main>
      </div>
  );
};

export default Error;
