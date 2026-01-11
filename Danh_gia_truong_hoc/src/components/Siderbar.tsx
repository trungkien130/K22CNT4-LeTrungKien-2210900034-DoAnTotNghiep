import { NavLink } from "react-router-dom";
import type { Role } from "../types";
import { Home, PenTool, History, Settings, PlusCircle } from "lucide-react";

interface MenuItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export default function Sidebar({ role }: { role: Role }) {
  const baseMenu: MenuItem[] = [
    { to: "/", label: "Tổng quan", icon: <Home className="w-5 h-5" /> },
    {
      to: "/evaluate",
      label: "Tự đánh giá",
      icon: <PenTool className="w-5 h-5" />,
    },
    { to: "/history", label: "Lịch sử", icon: <History className="w-5 h-5" /> },
  ];

  const menu =
    role === "LECTURER"
      ? [
          ...baseMenu,
          {
            to: "/add-evaluation",
            label: "Thêm đánh giá",
            icon: <PlusCircle className="w-5 h-5" />,
          },
        ]
      : role === "ADMIN"
      ? [
          ...baseMenu,
          {
            to: "/admin",
            label: "Quản trị",
            icon: <Settings className="w-5 h-5" />,
          },
        ]
      : baseMenu;

  return (
    <aside className="w-64 bg-white shadow-xl h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary mb-8">ĐH Nguyễn Trãi</h2>
        <nav className="space-y-2">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
