import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'riwayat',
      label: 'Riwayat',
      path: '/siswa/riwayat',
      icon: (isActive) => (
        <svg 
          className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
          />
        </svg>
      )
    },
    {
      id: 'home',
      label: 'Home',
      path: '/siswa/home',
      icon: (isActive) => (
        <svg 
          className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
          />
        </svg>
      )
    },
    {
      id: 'profil',
      label: 'Profil',
      path: '/siswa/profil',
      icon: (isActive) => (
        <svg 
          className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
      )
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
        <div className="flex justify-around items-center py-3 px-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'transform scale-105' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {item.icon(isActive)}
                <span 
                  className={`text-xs mt-1 font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;