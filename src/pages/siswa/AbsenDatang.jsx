import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAbsensi } from '../../hooks';
import { TimeCard, Loading, BottomNavbar } from '../../components';
import { generalAPI, absensiAPI } from '../../services/api';
import { PersonStanding, School } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import Swal from 'sweetalert2';


const AbsenDatang = () => {
    const { user } = useAuth();
    const { handleAbsen } = useAbsensi();
    const [location, setLocation] = useState(null);
    const [pengaturan, setPengaturan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [distanceInfo, setDistanceInfo] = useState(null);
    const mapRef = useRef(null);
    const markerSchoolRef = useRef(null);
    const markerUserRef = useRef(null);
    const circleRef = useRef(null);
    const polylineRef = useRef(null);
    const watchIdRef = useRef(null);
    const navigate = useNavigate();

    const handleAbsenWrapper = async () => {
        if (!location) {
            Swal.fire({
                icon: 'warning',
                title: 'Lokasi Tidak Tersedia',
                text: 'Mohon aktifkan GPS dan izinkan akses lokasi untuk melakukan absensi.',
                confirmButtonColor: '#003366'
            });
            return;
        }

        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Konfirmasi Absensi',
            text: 'Apakah Anda yakin ingin melakukan absensi datang sekarang?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#003366',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Absen Sekarang',
            cancelButtonText: 'Batal'
        });

        if (!result.isConfirmed) return;

        // Show loading
        setIsLoading(true);

        try {
            const res = await handleAbsen('datang', {
                latitude: location.latitude,
                longitude: location.longitude
            });

            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Absensi Berhasil!',
                    text: res.message,
                    confirmButtonColor: '#003366',
                    timer: 3000,
                    timerProgressBar: true
                }).then(() => {
                    // Redirect to home after success
                    navigate('/siswa/home');
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Absensi Gagal',
                    text: res.message,
                    confirmButtonColor: '#003366'
                });
            }
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Terjadi Kesalahan',
                text: 'Gagal melakukan absensi. Silakan coba lagi.',
                confirmButtonColor: '#003366'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <Loading text="Memuat data user..." />;
    }

    const startWatchingLocation = () => {
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

        setIsLocating(true);
        if (!navigator.geolocation) {
            Swal.fire({
                icon: 'error',
                title: 'GPS Tidak Tersedia',
                text: 'Browser Anda tidak mendukung geolokasi atau GPS tidak tersedia.',
                confirmButtonColor: '#003366'
            });
            return;
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                setLocation({
                    latitude,
                    longitude,
                });
                
                // Panggil API cek jarak
                absensiAPI.cekJarak({ latitude, longitude })
                    .then((res) => {
                        if (res.data?.responseData) {
                            setDistanceInfo(res.data.responseData);
                        }
                    })
                    .catch(() => {
                        setDistanceInfo(null);
                    });
                
                // Kita tidak mematikan isLocating di sini agar status tetap 'mencari' jika ingin update terus, 
                // tapi untuk UX tombol 'Refresh', kita set false setelah dapat update pertama.
                setIsLocating(false);
            },
            (error) => {
                // Hanya tampilkan error jika belum ada lokasi sama sekali
                if (!location) {
                    setIsLocating(false);
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal Mengambil Lokasi',
                        text: 'Pastikan GPS aktif dan izin lokasi diberikan.',
                        confirmButtonColor: '#003366'
                    });
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            }
        );
    };

    useEffect(() => {
        generalAPI.getPengaturan()
            .then((res) => {
                const pengaturanData = res.data?.responseData || res.data;
                setPengaturan(pengaturanData);
            })
            .catch(() => setPengaturan(null));

        startWatchingLocation();

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
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
        const updateMap = async () => {
            await injectLeaflet();
            const L = window.L;
            const container = document.getElementById('absen-map-datang');
            if (!container || !L) return;

            // Initialize map if not exists
            if (!mapRef.current) {
                const center = pengaturan ? [pengaturan.latitude, pengaturan.longitude] : [-6.2, 106.8];
                mapRef.current = L.map(container).setView(center, 17);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapRef.current);
            }

            // Update School Marker
            if (pengaturan) {
                const schoolCenter = [pengaturan.latitude, pengaturan.longitude];
                const schoolSvg = renderToStaticMarkup(<School color="#357ABD" size={20} strokeWidth={2} />);
                const schoolIcon = L.divIcon({
                    html: `<div style="width:36px;height:36px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #357ABD">${schoolSvg}</div>`,
                    className: 'school-marker-icon',
                    iconSize: [36, 36],
                    iconAnchor: [18, 36],
                });
                
                if (!markerSchoolRef.current) {
                    markerSchoolRef.current = L.marker(schoolCenter, { icon: schoolIcon }).addTo(mapRef.current);
                } else {
                    markerSchoolRef.current.setLatLng(schoolCenter);
                }

                if (circleRef.current) circleRef.current.remove();
                circleRef.current = L.circle(schoolCenter, { radius: Number(pengaturan.radius_meter) || 0, color: '#4A90E2', weight: 2, fillColor: '#4A90E2', fillOpacity: 0.15 }).addTo(mapRef.current);
            }

            // Update User Marker
            if (location) {
                const userPos = [location.latitude, location.longitude];
                const userIcon = L.divIcon({
                    html: renderToStaticMarkup(<PersonStanding size={36} color="#357ABD" />),
                    className: 'user-marker-icon',
                    iconSize: [36, 36],
                    iconAnchor: [18, 36],
                });

                if (markerUserRef.current) {
                    markerUserRef.current.setLatLng(userPos);
                    mapRef.current.panTo(userPos);
                } else {
                    markerUserRef.current = L.marker(userPos, { icon: userIcon }).addTo(mapRef.current);
                    mapRef.current.setView(userPos, 17);
                }

                // Draw dashed red line between user and school
                if (pengaturan) {
                    const schoolPos = [pengaturan.latitude, pengaturan.longitude];
                    
                    if (polylineRef.current) {
                        polylineRef.current.remove();
                    }
                    
                    polylineRef.current = L.polyline([userPos, schoolPos], {
                        color: '#ef4444',
                        weight: 2,
                        opacity: 0.8,
                        dashArray: '10, 10'
                    }).addTo(mapRef.current);
                }
            }
        };

        updateMap();
    }, [pengaturan, location]);

    // Cleanup map on unmount
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            markerSchoolRef.current = null;
            markerUserRef.current = null;
            circleRef.current = null;
            polylineRef.current = null;
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Max width wrapper untuk tampilan mobile-like di semua device */}
            <div className="mx-auto max-w-md">
                <div className="px-4 pt-8 pb-6 bg-gradient-to-br from-[#4A90E2] to-[#357ABD]">
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <p className="text-2xl font-bold">Absen Datang</p>
                            <p className="text-sm opacity-90">SMK Trimulia</p>
                        </div>
                        <button onClick={() => navigate('/siswa/home')} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded">Kembali</button>
                    </div>
                </div>


            <main className="px-4 py-8">
                <div className="grid grid-cols-1 gap-6 mb-8">
                    {/* <TimeCard title="Waktu Saat Ini" showDate={true} /> */}
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div id="absen-map-datang" className="w-full h-64 rounded-md overflow-hidden border" />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 flex flex-col justify-center">
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                            Titik Lokasi Saat Ini
                        </p>
                        {location ? (
                            <>
                                <div className="text-sm text-gray-700 space-y-0.5">
                                    <p>
                                        Latitude:&nbsp;
                                        <span className="font-mono">
                                            {location.latitude.toFixed(6)}
                                        </span>
                                    </p>
                                    <p>
                                        Longitude:&nbsp;
                                        <span className="font-mono">
                                            {location.longitude.toFixed(6)}
                                        </span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={startWatchingLocation}
                                    disabled={isLocating}
                                    className="mt-3 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isLocating ? 'Mencari lokasi...' : 'Refresh GPS'}
                                </button>
                            </>
                        ) : (
                            <p className="text-sm text-gray-500">
                                {isLocating ? 'Mengambil lokasi...' : 'Sedang mengambil lokasi GPS...'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Informasi Jarak ke Radius */}
                {location && pengaturan && distanceInfo && (
                    <div className={`rounded-xl shadow-sm p-4 border mb-6 ${
                        distanceInfo.dalam_radius 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                    }`}>
                        <div className="flex items-start gap-3">
                            {distanceInfo.dalam_radius ? (
                                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1">
                                <p className={`font-semibold text-sm mb-1 ${
                                    distanceInfo.dalam_radius ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {distanceInfo.dalam_radius 
                                        ? 'Anda berada di dalam radius sekolah' 
                                        : 'Anda berada di luar radius sekolah'}
                                </p>
                                <p className={`text-sm ${
                                    distanceInfo.dalam_radius ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    Jarak Anda: <span className="font-mono font-semibold">{distanceInfo.distance}</span> meter dari sekolah
                                </p>
                                {!distanceInfo.dalam_radius && distanceInfo.sisa_meter > 0 && (
                                    <p className="text-sm text-red-700 mt-1">
                                        Anda perlu mendekat <span className="font-mono font-semibold">{distanceInfo.sisa_meter}</span> meter lagi
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* Absen Button */}
                <button
                    onClick={handleAbsenWrapper}
                    disabled={isLoading || !location}
                    className={`w-full px-8 py-4 rounded-xl font-semibold text-lg transition duration-200 shadow-lg ${isLoading || !location
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-[#003366] text-white hover:bg-[#002244]'
                        }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memproses...
                        </div>
                    ) : (
                        'Absen Datang'
                    )}
                </button>


               
            </main>

            {/* Bottom Navigation */}
            <BottomNavbar />
        </div>
        </div>
    );
};

export default AbsenDatang;
