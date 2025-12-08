import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAbsensi } from '../../hooks';
import { TimeCard, Loading } from '../../components';
import { generalAPI } from '../../services/api';
import { PersonStanding, School } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

const AbsenPulang = () => {
    const { user } = useAuth();
    const { handleAbsen } = useAbsensi();
    const [result, setResult] = useState(null);
    const [location, setLocation] = useState(null);
    const [pengaturan, setPengaturan] = useState(null);
    const mapRef = useRef(null);
    const markerSchoolRef = useRef(null);
    const markerUserRef = useRef(null);
    const circleRef = useRef(null);
    const navigate = useNavigate();

    const handleAbsenWrapper = async () => {
        if (!location) return;
        const res = await handleAbsen('pulang', { latitude: location.latitude, longitude: location.longitude });
        setResult(res);
    };

    if (!user) {
        return <Loading text="Memuat data user..." />;
    }

    useEffect(() => {
        generalAPI.getPengaturan().then((res) => setPengaturan(res.data)).catch(() => setPengaturan(null));
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
            });
        }
    }, []);

    const injectLeaflet = () => {
        return new Promise((resolve) => {
            if (window.L) return resolve();
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            css.onload = check;
            document.head.appendChild(css);
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = check;
            document.body.appendChild(script);
            let loaded = 0;
            function check() { loaded += 1; if (loaded === 2) resolve(); }
        });
    };

    useEffect(() => {
        const init = async () => {
            await injectLeaflet();
            const L = window.L;
            const container = document.getElementById('absen-map-pulang');
            if (!container || !L) return;
            if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
            const center = pengaturan ? [pengaturan.latitude, pengaturan.longitude] : [-6.2, 106.8];
            mapRef.current = L.map(container).setView(center, 17);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapRef.current);
            if (pengaturan) {
                const schoolIcon = L.divIcon({
                    html: renderToStaticMarkup(<School size={36} color="#357ABD" />),
                    className: 'school-marker-icon',
                    iconSize: [36, 36],
                    iconAnchor: [18, 36],
                });
                if (markerSchoolRef.current) markerSchoolRef.current.remove();
                markerSchoolRef.current = L.marker(center, { icon: schoolIcon }).addTo(mapRef.current);
                if (circleRef.current) circleRef.current.remove();
                circleRef.current = L.circle(center, { radius: Number(pengaturan.radius_meter) || 0, color: '#4A90E2', weight: 2, fillColor: '#4A90E2', fillOpacity: 0.15 }).addTo(mapRef.current);
            }
            if (location) {
                const user = [location.latitude, location.longitude];
                const userIcon = L.divIcon({
                    html: renderToStaticMarkup(<PersonStanding size={36} color="#357ABD" />),
                    className: 'user-marker-icon',
                    iconSize: [36, 36],
                    iconAnchor: [18, 36],
                });
                if (markerUserRef.current) markerUserRef.current.remove();
                markerUserRef.current = L.marker(user, { icon: userIcon }).addTo(mapRef.current);
            }
            const bounds = [];
            if (pengaturan) bounds.push(center);
            if (location) bounds.push([location.latitude, location.longitude]);
            if (bounds.length >= 2) { mapRef.current.fitBounds(bounds, { padding: [20, 20] }); }
        };
        init();
        return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } markerSchoolRef.current = null; markerUserRef.current = null; circleRef.current = null; };
    }, [pengaturan, location]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="px-4 pt-8 pb-6 bg-gradient-to-br from-[#4A90E2] to-[#357ABD]">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <p className="text-2xl font-bold">Absen Pulang</p>
                            <p className="text-sm opacity-90">SMK Trimulia</p>
                        </div>
                        <button onClick={() => navigate('/siswa/home')} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded">Kembali</button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <TimeCard title="Waktu Saat Ini" showDate={true} />
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div id="absen-map-pulang" className="w-full h-64 rounded-md overflow-hidden border" />
                    </div>
                </div>

                {/* Absen Button */}
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
                    <div className="w-24 h-24 bg-[#f0ca30] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-[#f0ca30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Absen Pulang
                    </h3>

                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Klik tombol di bawah untuk melakukan absensi pulang. Pastikan Anda berada di dalam lingkungan sekolah.
                    </p>

                    <button
                        onClick={handleAbsenWrapper}
                        className="bg-[#f0ca30] text-[#003366] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#e6b82a] transition duration-200 shadow-lg"
                    >
                        Absen Pulang
                    </button>
                </div>

                {/* Info Card */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h4 className="text-sm font-medium text-yellow-800 mb-2">
                                Informasi Penting
                            </h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Absensi pulang hanya dapat dilakukan setelah absensi datang</li>
                                <li>• Absensi pulang dapat dilakukan mulai pukul 15:00 WIB</li>
                                <li>• Pastikan GPS aktif dan browser mengizinkan akses lokasi</li>
                                <li>• Absensi pulang harus dilakukan di dalam radius 50 meter dari sekolah</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {result && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <div className={`rounded-xl p-6 border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className={`text-lg font-semibold mb-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>{result.success ? 'Berhasil' : 'Gagal'}</div>
                        <div className={`${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AbsenPulang;
