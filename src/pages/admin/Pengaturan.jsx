import { useEffect, useRef, useState } from "react";
import { Loading, Notification } from "../../components";
import Swal from "sweetalert2";
import { adminAPI } from "../../services/api";
import MapsLinkInput from "../../components/MapasLinkInput";

export default function AdminPengaturan() {
  const [form, setForm] = useState({
    latitude: -6.229728,
    longitude: 106.689431,
    radius_meter: 50,
    jam_masuk: "07:00",
    jam_pulang: "15:30",
    toleransi_telat: 10,
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);


  const extractLatLngFromGoogleMapsUrl = (url) => {
    // format umum: .../@lat,lng,zoom...
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);

    if (!match) return null;

    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2]),
    };
  };


  const loadSettings = async (showAlert = false) => {
    setLoading(true);
    try {
      const res = await adminAPI.getSettings();
      const s = res?.data?.responseData || res?.data || {};
      setForm((prev) => ({
        ...prev,
        latitude: s.latitude ?? prev.latitude,
        longitude: s.longitude ?? prev.longitude,
        radius_meter: s.radius_meter ?? prev.radius_meter,
        jam_masuk: s.jam_masuk ? String(s.jam_masuk).slice(0, 5) : prev.jam_masuk,
        jam_pulang: s.jam_pulang ? String(s.jam_pulang).slice(0, 5) : prev.jam_pulang,
        toleransi_telat: s.toleransi_telat ?? prev.toleransi_telat,
      }));
      if (showAlert) {
        Swal.fire({ icon: "success", title: "Berhasil", text: "Pengaturan berhasil direset dari server" });
      }
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal memuat pengaturan dari server";
      if (showAlert) Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const injectLeaflet = () => {
    return new Promise((resolve) => {
      if (window.L) return resolve();

      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      css.onload = checkDone;
      document.head.appendChild(css);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = checkDone;
      document.body.appendChild(script);

      let loaded = 0;
      function checkDone() {
        loaded++;
        if (loaded === 2) resolve();
      }
    });
  };


  const initMap = async () => {
    await injectLeaflet();
    const L = window.L;
    if (!L) return;
    if (mapRef.current) mapRef.current.remove();
    mapRef.current = L.map("map-picker").setView([form.latitude, form.longitude], 17);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(mapRef.current);
    markerRef.current = L.marker([form.latitude, form.longitude], { draggable: true }).addTo(mapRef.current);
    markerRef.current.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    });
    mapRef.current.on("click", (e) => {
      const { lat, lng } = e.latlng;
      markerRef.current.setLatLng([lat, lng]);
      setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    });
  };


  // INIT DATA & MAP — load data lalu init map setelah loading selesai
  useEffect(() => {
    loadSettings();
  }, []);

  const initDoneRef = useRef(false);
  useEffect(() => {
    if (!loading && !initDoneRef.current) {
      initMap();
      initDoneRef.current = true;
    }
  }, [loading]);


  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const L = window.L;
    if (!L) return;

    // Pindahkan map dan marker ke lokasi baru
    markerRef.current.setLatLng([form.latitude, form.longitude]);
    mapRef.current.setView([form.latitude, form.longitude], 17);
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [form.latitude, form.longitude]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const payload = {
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radius_meter: Number(form.radius_meter),
        jam_masuk: form.jam_masuk,
        jam_pulang: form.jam_pulang,
        toleransi_telat: Number(form.toleransi_telat),
      };
      await adminAPI.updateSettings(payload);
      setNotification({ type: "success", message: "Pengaturan berhasil disimpan." });
      Swal.fire({ icon: "success", title: "Berhasil", text: "Pengaturan berhasil disimpan" });
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal menyimpan pengaturan. Periksa API backend.";
      setNotification({ type: "error", message: msg });
      Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 2000);
    }
  };

  if (loading && !mapRef.current) {
    return <Loading text="Memuat pengaturan..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
     
      <Notification notification={notification} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Picker */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Lokasi Sekolah</h3>
            <MapsLinkInput
              onResult={(coords) => {
                setForm((prev) => ({
                  ...prev,
                  latitude: coords.latitude,
                  longitude: coords.longitude
                }));
              }}
            />



            <div id="map-picker" className="w-full h-[380px] rounded-lg overflow-hidden border"></div>
            <p className="mt-3 text-sm text-gray-600">Klik pada peta atau seret marker untuk mengatur lokasi. Latitude dan longitude akan terisi otomatis.</p>
          </div>

          {/* Form Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfigurasi Sistem</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input type="number" step="0.000001" name="latitude" value={form.latitude} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input type="number" step="0.000001" name="longitude" value={form.longitude} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Radius (meter)</label>
                <input type="number" min="10" name="radius_meter" value={form.radius_meter} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
                  <input type="time" name="jam_masuk" value={form.jam_masuk} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Pulang</label>
                  <input type="time" name="jam_pulang" value={form.jam_pulang} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Toleransi Terlambat (menit)</label>
                <input type="number" min="0" name="toleransi_telat" value={form.toleransi_telat} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>

              <div className="flex gap-2 mt-2">
                <button disabled={loading} onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">Simpan</button>
                <button disabled={loading} onClick={() => loadSettings(true)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">Reset dari server</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}