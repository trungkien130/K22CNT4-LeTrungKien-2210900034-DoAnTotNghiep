import { LogOut, User, Menu } from "lucide-react";

interface AdminNavProps {
  onLogout: () => void;
  onMenuClick?: () => void;
}

export default function AdminNav({ onLogout, onMenuClick }: AdminNavProps) {
  const user = localStorage.getItem("user");
  const userName = user ? JSON.parse(user)?.fullName || "Admin" : "Admin";

  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button 
          className="lg:hidden p-1 hover:bg-gray-100 rounded transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={24} className="text-gray-700" />
        </button>
        <div className="text-lg font-semibold text-purple-600 truncate">
          Quản trị hệ thống
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-gray-700">
          <User size={20} />
          <span className="font-medium">{userName}</span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
                     text-white bg-purple-600 hover:bg-purple-700"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
