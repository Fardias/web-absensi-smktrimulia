import React, { useState, useEffect } from "react";
import Sidebar from "./SideBar";

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleMobileSidebar = (isOpen) => {
    if (typeof isOpen === 'boolean') {
      setIsMobileOpen(isOpen);
    } else {
      setIsMobileOpen(prev => !prev);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar
        defaultCollapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onMobileToggle={toggleMobileSidebar}
      />

      <main
        className={`
          flex-1 transition-all duration-200 overflow-y-auto
          ${isMobile 
            ? "ml-0" // Mobile: no margin
            : collapsed 
              ? "ml-[72px]" 
              : "ml-[260px] mt-4"
          }
        `}
      >
        {/* Hamburger Menu Button - hanya tampil di mobile, posisi relative */}
        {isMobile && (
          <div className="lg:hidden bg-white shadow-sm border-b p-4">
            <button
              onClick={() => toggleMobileSidebar()}
              className="bg-slate-900 text-white p-2 rounded-md shadow-lg"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
        
        <div className={isMobile ? "p-4" : ""}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
