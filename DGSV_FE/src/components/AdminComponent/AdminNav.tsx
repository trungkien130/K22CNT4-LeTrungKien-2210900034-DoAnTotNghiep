import { LogOut, User } from "lucide-react";

export default function AdminNav({ onLogout }: { onLogout: () => void }) {
  const user = localStorage.getItem("user");
  const userName = user ? JSON.parse(user)?.fullName || "Admin" : "Admin";

  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">
      <div className="text-lg font-semibold text-purple-600">
        Quản trị hệ thống
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
