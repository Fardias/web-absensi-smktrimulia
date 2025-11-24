import { useState } from "react";

export default function MapsLinkInput({ onResult }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Regex extractor lat,lng
  const extractLatLng = (text) => {
    const regex1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;            // @lat,lng
    const regex2 = /=(-?\d+\.\d+),(-?\d+\.\d+)/;            // =lat,lng
    const regex3 = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;        // !3dlat!4dlng

    const match = text.match(regex1) || text.match(regex2) || text.match(regex3);
    if (!match) return null;

    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2])
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Masukkan link Google Maps terlebih dahulu.");
      return;
    }

    // Deteksi short link → tidak bisa digunakan
    if (url.includes("maps.app.goo.gl") || url.includes("goo.gl")) {
      setError(
        "Link yang kamu masukkan adalah short link. Harap buka link itu, lalu copy link panjang Google Maps."
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const coords = extractLatLng(url);

      if (!coords) {
        setError("Koordinat tidak ditemukan di link ini. Pastikan link Google Maps sudah benar.");
      } else {
        onResult(coords); // Kirim hasil
      }

      setLoading(false);
    }, 300);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Input Link Google Maps</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          

          <input
            type="text"
            placeholder="https://www.google.com/maps/place/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="
              w-full px-4 py-2
              border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-all outline-none
            "
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="
            bg-blue-600 hover:bg-blue-700
            text-white px-4 py-2 rounded-lg text-sm font-medium
            disabled:opacity-50 disabled:cursor-not-allowed
            transition
          "
        >
          {loading ? "Memproses..." : "Ambil Lokasi"}
        </button>
      </form>
    </div>
  );
}
