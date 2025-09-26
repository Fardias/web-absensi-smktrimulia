import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ title, subtitle, showBackButton = false, backPath = '/siswa/home' }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'admin': return 'Administrator';
            case 'gurket': return 'Guru Piket';
            case 'walas': return 'Wali Kelas';
            case 'siswa': return 'Siswa';
            default: return role;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'gurket': return 'bg-blue-100 text-blue-800';
            case 'walas': return 'bg-green-100 text-green-800';
            case 'siswa': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <header className="bg-white border-b shadow-sm">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center">
                        {showBackButton && (
                            <button
                                onClick={() => navigate(backPath)}
                                className="p-2 mr-4 text-gray-400 transition duration-200 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center mr-3 px-6">
                            <span className="text-lg font-bold text-white">SMK</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                            <p className="text-sm text-gray-500">{subtitle}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user?.role)}`}>
                                {getRoleDisplayName(user?.role)}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-white transition duration-200 bg-red-500 rounded-lg hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
