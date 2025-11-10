import React, { useState } from "react";
import Sidebar from "./SideBar";

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar
        defaultCollapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <main
        className={`
          flex-1 transition-all duration-200 overflow-y-auto
          ${collapsed ? "ml-[72px]" : "ml-[260px] mt-4"}
        `}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
