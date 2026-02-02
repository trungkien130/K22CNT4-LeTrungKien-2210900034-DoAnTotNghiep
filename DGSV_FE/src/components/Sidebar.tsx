import { useMemo, useEffect } from "react";
import { NavLink } from "react-router-dom";
import type { Role } from "../types";
import { Home, PenTool, History, Settings, PlusCircle, Users, BookOpen, Shield, Layers, HelpCircle, MessageSquare } from "lucide-react";
import logo from "../../public/Img/logo.png";
import api from "../API/api";
import { hasPermission } from "../utils/permissionUtils";

interface MenuItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: Role;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, isOpen = false, onClose }: SidebarProps) {
  // const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Unused
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (user) {
          const userId = user.userId ?? user.mssv;
          const res = await api.getUserInfo(user.role, String(userId));
          console.log("User info fetched:", res.data);
          // setUserInfo(res.data);
        }
      } catch (error) {
        console.error("Sidebar: Failed to fetch user info", error);
      }
    };
    fetchInfo();
  }, []); // Run once on mount

  const menu = useMemo(() => {
    const items: MenuItem[] = [];

    // ================= COMMON / STUDENT =================
    // If user is explicitly a STUDENT, they always get these
    // OR if they are Admin but might want basic views (optional, but requested "access main page")
    // Loose check for role to avoid overlap issues if subtypes are strictly defined
    const r = role as string;
    if (r === "STUDENT" || r === "ADMIN" || r === "SUPPER_ADMIN" || r === "LECTURER") {
        items.push({ to: "/", label: "Tổng quan", icon: <Home className="w-5 h-5" /> });
    }

    if (role === "STUDENT") {
       items.push(
         { to: "/selfEvaluation", label: "Tự đánh giá", icon: <PenTool className="w-5 h-5" /> },
         { to: "/history", label: "Lịch sử", icon: <History className="w-5 h-5" /> }
       );

       // ✅ ADDED: Show "My Class" for Class Monitors
       if (hasPermission(user, "CLASS_MONITOR") || hasPermission(user, "MONITOR")) {
          items.push({ to: "/my-class", label: "Lớp của tôi", icon: <Users className="w-5 h-5" /> });
       }

       // ✅ ADDED: Feedback
       // ✅ ADDED: Feedback
       items.push({ to: "/feedback", label: "Đóng góp ý kiến", icon: <MessageSquare className="w-5 h-5" /> });
    }

    // ================= LECTURER =================
    if (role === "LECTURER") {
       items.push(
         { to: "/lecturer-classes", label: "Lớp giảng dạy", icon: <BookOpen className="w-5 h-5" /> },
         { to: "/add-evaluation", label: "Thêm đánh giá", icon: <PlusCircle className="w-5 h-5" /> }
       );
    }

    // ================= ADMIN (PERMISSION BASED) =================
    
    // 1. Quản trị (General Dashboard)
    // Show if has ANY admin access
    if (hasPermission(user, "SYSTEM_ADMIN") || role === "ADMIN" || (role as string) === "SUPPER_ADMIN") {
        items.push({ to: "/admin", label: "Dashboard Quản trị", icon: <Settings className="w-5 h-5" /> });
    }

    // 2. Semesters
    if (hasPermission(user, "SEM_MANAGE")) {
        items.push({ to: "/admin/semesters", label: "Học kỳ", icon: <History className="w-5 h-5" /> });
    }

    // 3. Departments
    if (hasPermission(user, "DEPT_MANAGE")) {
        items.push({ to: "/admin/departments", label: "Khoa", icon: <Layers className="w-5 h-5" /> });
    }

    // 4. Classes
    if (hasPermission(user, "CLASS_MANAGE") || hasPermission(user, "CLASS_VIEW_LIST")) {
        items.push({ to: "/admin/classes", label: "Lớp", icon: <PenTool className="w-5 h-5" /> });
    }

    // 5. Users
    if (hasPermission(user, "USER_VIEW") || hasPermission(user, "USER_MANAGE")) {
         items.push({ to: "/admin/users", label: "Quản lý người dùng", icon: <Users className="w-5 h-5" /> });
    }

    // 6. Permissions
    if (hasPermission(user, "PERMISSION_MANAGE")) {
        items.push({ to: "/permissions", label: "Phân quyền", icon: <Shield className="w-5 h-5" /> });
    }

    // 7. Questions & Answers (New)
    if (hasPermission(user, "QUESTION_MANAGE")) {
        items.push({ to: "/admin/questions", label: "Ngân hàng câu hỏi", icon: <HelpCircle className="w-5 h-5" /> });
    }
    
    return items;
  }, [role, user]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 z-[100] h-screen w-64 bg-white shadow-xl overflow-y-auto transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6" style={{ zoom: "90%" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-800 leading-none">Đại học</span>
                    <span className="text-xl font-bold text-blue-700 leading-none">Nguyễn Trãi</span>
                </div>
            </div>
            {/* Close Button for Mobile */}
            <button 
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <nav className="space-y-2">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose} // Close sidebar on mobile when item clicked
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
    </>
  );
}
