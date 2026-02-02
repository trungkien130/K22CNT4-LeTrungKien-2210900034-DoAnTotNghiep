import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onMenuClick?: () => void;
}

export default function Navbar({ user, onLogout, onMenuClick }: NavbarProps) {
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate("/user-detail"); // chuyển sang trang UserDetail
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-1 hover:bg-blue-700 rounded transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        <h1 className="font-bold text-lg md:text-xl truncate">TỰ ĐÁNH GIÁ SINH VIÊN</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <div
          className="cursor-pointer text-right font-medium hover:text-red-200 transition-colors hidden md:block"
          onClick={handleUserClick}
        >
          {user.name}
        </div>
        
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded transition-colors text-sm font-medium"
        >
          <LogOut size={16} /> <span className="hidden md:inline">Đăng xuất</span>
        </button>
      </div>
    </nav>
  );
}
