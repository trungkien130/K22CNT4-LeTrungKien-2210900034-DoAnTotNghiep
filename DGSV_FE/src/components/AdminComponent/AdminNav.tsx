import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminNav() {
  const navigate = useNavigate();

  const user = localStorage.getItem("user");
  const userName = user ? JSON.parse(user)?.fullName || "Admin" : "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">
      {/* LEFT */}
      <div className="text-lg font-semibold text-purple-600">
        Quản trị hệ thống
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* USER INFO */}
        <div className="flex items-center gap-2 text-gray-700">
          <User size={20} />
          <span className="font-medium">{userName}</span>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                     text-white bg-purple-600 hover:bg-purple-700 transition"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
