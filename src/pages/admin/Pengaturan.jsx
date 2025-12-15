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
  const circleRef = useRef(null);
  const initAttemptsRef = useRef(0);
  const [mapProgress, setMapProgress] = useState(0);
  const [mapOverlayVisible, setMapOverlayVisible] = useState(true);
  const tileStatsRef = useRef({ started: 0, loaded: 0 });


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
      const msg = e?.response?.data?.responseMessage || "Gagal memuat pengaturan dari server";
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
      css.onerror = () => {
        setNotification({ type: "error", message: "Gagal memuat stylesheet Leaflet." });
      };
      document.head.appendChild(css);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = checkDone;
      script.onerror = () => {
        setNotification({ type: "error", message: "Gagal memuat script Leaflet." });
        setMapOverlayVisible(false);
      };
      document.body.appendChild(script);

      let loaded = 0;
      let attempts = 0;
      function checkDone() {
        loaded++;
        if (loaded === 1) setMapProgress((p) => Math.max(p, 50));
        if (loaded === 2) {
          const iv = setInterval(() => {
            attempts++;
            if (window.L) {
              clearInterval(iv);
              setMapProgress((p) => Math.max(p, 70));
              resolve();
            } else if (attempts > 60) {
              clearInterval(iv);
              resolve();
            }
          }, 50);
        }
      }
    });
  };


  const initMap = async () => {
    await injectLeaflet();
    const L = window.L;
    if (!L) return;
    const container = document.getElementById("map-picker");
    if (!container) {
      if (initAttemptsRef.current < 5) {
        initAttemptsRef.current += 1;
        setTimeout(initMap, 100);
      }
      return;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    tileStatsRef.current = { started: 0, loaded: 0 };
    mapRef.current = L.map(container).setView([form.latitude, form.longitude], 17);
    initDoneRef.current = true;
    setMapProgress((p) => Math.max(p, 80));
    const tl = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 });
    tl.on("tileloadstart", () => {
      tileStatsRef.current.started += 1;
      const { started, loaded } = tileStatsRef.current;
      const ratio = loaded / Math.max(started, 1);
      const pct = 80 + Math.floor(ratio * 19);
      setMapProgress((p) => Math.max(p, Math.min(99, pct)));
    });
    tl.on("tileload", () => {
      tileStatsRef.current.loaded += 1;
      const { started, loaded } = tileStatsRef.current;
      const ratio = loaded / Math.max(started, 1);
      const pct = 80 + Math.floor(ratio * 19);
      setMapProgress((p) => Math.max(p, Math.min(99, pct)));
    });
    tl.on("load", () => {
      setMapProgress(100);
      setTimeout(() => setMapOverlayVisible(false), 300);
    });
    tl.on("tileerror", () => {
      const { started, loaded } = tileStatsRef.current;
      const ratio = loaded / Math.max(started, 1);
      const pct = 80 + Math.floor(ratio * 19);
      setMapProgress((p) => Math.max(p, Math.min(99, pct)));
      setTimeout(() => setMapOverlayVisible(false), 800);
    });
    tl.addTo(mapRef.current);
    setTimeout(() => {
      if (mapOverlayVisible) {
        setMapProgress((p) => Math.max(p, 95));
        setMapOverlayVisible(false);
      }
    }, 5000);
    markerRef.current = L.marker([form.latitude, form.longitude], { draggable: true }).addTo(mapRef.current);
    markerRef.current.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
    });
    mapRef.current.on("click", (e) => {
      const { lat, lng } = e.latlng;
      markerRef.current.setLatLng([lat, lng]);
      setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
    });

    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }
    circleRef.current = L.circle([form.latitude, form.longitude], {
      radius: Number(form.radius_meter) || 0,
      color: "#4A90E2",
      weight: 2,
      fillColor: "#4A90E2",
      fillOpacity: 0.15,
    }).addTo(mapRef.current);
  };


  // INIT DATA & MAP — load data lalu init map setelah loading selesai
  useEffect(() => {
    loadSettings();
  }, []);

  const initDoneRef = useRef(false);
  useEffect(() => {
    if (!loading && !initDoneRef.current) {
      initMap();
    }
  }, [loading]);


  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const L = window.L;
    if (!L) return;

    // Pindahkan map dan marker ke lokasi baru
    markerRef.current.setLatLng([form.latitude, form.longitude]);
    mapRef.current.setView([form.latitude, form.longitude], 17);
    if (circleRef.current) circleRef.current.setLatLng([form.latitude, form.longitude]);
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [form.latitude, form.longitude]);

  useEffect(() => {
    if (!mapRef.current || !circleRef.current) return;
    const newRadius = Number(form.radius_meter) || 0;
    circleRef.current.setRadius(newRadius);
  }, [form.radius_meter]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
    };
  }, []);

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
      const msg = e?.response?.data?.responseMessage || "Gagal menyimpan pengaturan. Periksa API backend.";
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


            <div className="relative">
              <div id="map-picker" className="w-full h-[380px] rounded-lg overflow-hidden border"></div>
              {mapOverlayVisible && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <div className="w-72 bg-white rounded-lg shadow p-4 text-center">
                    <div className="text-sm font-medium text-gray-700">Memuat peta...</div>
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded">
                      <div
                        className="h-2 bg-blue-600 rounded"
                        style={{ width: `${mapProgress}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-600">{mapProgress}%</div>
                  </div>
                </div>
              )}
            </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Datang</label>
                  <input type="time" name="jam_masuk" value={form.jam_masuk} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Pulang</label>
                  <input type="time" name="jam_pulang" value={form.jam_pulang} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Toleransi Terlambat Jam Datang (menit)</label>
                <input type="number" min="0" name="toleransi_telat" value={form.toleransi_telat} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>

              <div className="mt-2 ">
                <button disabled={loading} onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 w-full">Simpan</button>
                {/* <button disabled={loading} onClick={() => loadSettings(true)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">Reset dari server</button> */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
