import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminComponent/AdminSidebar";
import AdminNav from "../../components/AdminComponent/AdminNav";
import { useState } from "react";

export default function AdminLayout({ onLogout }: { onLogout: () => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNav 
          onLogout={onLogout} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 bg-gray-100/50 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
