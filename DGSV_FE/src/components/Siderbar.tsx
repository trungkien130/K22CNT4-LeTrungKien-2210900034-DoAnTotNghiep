import { useMemo, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import type { Role, UserInfo } from "../types";
import { Home, PenTool, History, Settings, PlusCircle, Users, BookOpen } from "lucide-react";
import logo from "../../public/Img/logo.png";
import api from "../API/api";

interface MenuItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export default function Sidebar({ role }: { role: Role }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const userId = user.userId ?? user.mssv;
          const res = await api.getUserInfo(user.role, String(userId));
          setUserInfo(res.data);
        }
      } catch (error) {
        console.error("Sidebar: Failed to fetch user info", error);
      }
    };

    if (role === "STUDENT") {
      fetchInfo();
    }
  }, [role]);

  const menu = useMemo(() => {
    const baseMenu: MenuItem[] = [
      { to: "/", label: "Tổng quan", icon: <Home className="w-5 h-5" /> },
      {
        to: "/selfEvaluation",
        label: "Tự đánh giá",
        icon: <PenTool className="w-5 h-5" />,
      },
      { to: "/history", label: "Lịch sử", icon: <History className="w-5 h-5" /> },
    ];

    if (role === "LECTURER") {
      return [
        ...baseMenu,
        {
          to: "/lecturer-classes",
          label: "Lớp giảng dạy",
          icon: <BookOpen className="w-5 h-5" />,
        },
        {
          to: "/add-evaluation",
          label: "Thêm đánh giá",
          icon: <PlusCircle className="w-5 h-5" />,
        },
      ];
    }

    if (role === "ADMIN") {
      return [
        ...baseMenu,
        {
          to: "/admin",
          label: "Quản trị",
          icon: <Settings className="w-5 h-5" />,
        },
        { to: "/admin/semesters", label: "Học kỳ", icon: <History className="w-5 h-5" /> },
        { to: "/admin/departments", label: "Khoa", icon: <Home className="w-5 h-5" /> },
        { to: "/admin/classes", label: "Lớp", icon: <PenTool className="w-5 h-5" /> },
      ];
    }

    // Role is STUDENT
    const isMonitor = userInfo?.position?.toLowerCase() === "lt" || 
                      userInfo?.position?.toLowerCase() === "lớp trưởng";

    if (isMonitor) {
      return [
        ...baseMenu,
        {
          to: "/my-class",
          label: "Lớp của tôi",
          icon: <Users className="w-5 h-5" />,
        },
      ];
    }

    return baseMenu;
  }, [role, userInfo]);

  return (
    <aside className="w-64 bg-white shadow-xl h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
            <img src={logo} alt="Logo" className="w-20 h-20 object-contain" />
            <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-800 leading-none">Đại học</span>
                <span className="text-xl font-bold text-blue-700 leading-none">Nguyễn Trãi</span>
            </div>
        </div>
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
