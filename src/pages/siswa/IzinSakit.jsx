import { useAuth } from '../../contexts/AuthContext';
import { Header, Loading } from '../../components';

const IzinSakit = () => {
  const { user } = useAuth();

  if (!user) {
    return <Loading text="Memuat data user..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Izin/Sakit" 
        subtitle="SMK Trimulia" 
        showBackButton={true}
        backPath="/siswa/home"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Izin/Sakit</h2>
          <p className="text-gray-600">Halaman ini sedang dalam pengembangan.</p>
        </div>
      </main>
    </div>
  );
};

export default IzinSakit;
