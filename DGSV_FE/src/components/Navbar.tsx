import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate("/user-detail"); // chuyển sang trang UserDetail
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="font-bold">TỰ ĐÁNH GIÁ SINH VIÊN</h1>
      <div className="flex items-center gap-4">
        <div
          className="cursor-pointer text-right font-medium hover:text-red-500"
          onClick={handleUserClick}
        >
          {user.name}
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-500 px-3 py-2 rounded"
        >
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </nav>
  );
}
