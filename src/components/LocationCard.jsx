import { useGeolocation } from '../hooks';

const LocationCard = () => {
    const { location, error, loading } = useGeolocation();

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Lokasi</h3>
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003366]"></div>
                    </div>
                    <p className="text-gray-600">Mendeteksi lokasi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Lokasi</h3>
            <div className="text-center">
                {location ? (
                    <div>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-green-600 font-medium">Lokasi Terdeteksi</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Lat: {location.latitude.toFixed(6)}<br />
                            Lng: {location.longitude.toFixed(6)}
                        </p>
                    </div>
                ) : (
                    <div>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <p className="text-red-600 font-medium">Lokasi Tidak Terdeteksi</p>
                        <p className="text-sm text-gray-500 mt-1">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationCard;
