import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Users,
  CheckSquare,
  BookOpen,
  Building,
  GraduationCap,
  Shield,
  Home
} from "lucide-react";
import { hasPermission } from "../../utils/permissionUtils";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  const linkClass = ({ isActive }: any) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${
      isActive ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-200"
    }`;

  // Helper to check permission
  const check = (code: string) => hasPermission(user, code);
  // Helper for super admin or specific role logic
  const content = [];

  // 1. Dashboard (General)
  if (role === "ADMIN" || role === "SUPPER_ADMIN" || check("SYSTEM_ADMIN")) {
      content.push(
        <NavLink key="dashboard" to="/admin" end className={linkClass} onClick={onClose}>
          <LayoutDashboard size={18} /> Tổng quan
        </NavLink>
      );
  } else {
       // If not strictly admin but has access to admin panel via specific permission, maybe show a "Home" or "Welcome"
       // or just let them see "Tổng quan" if that page is generic enough?
       // For now, let's allow "Tổng quan" for everyone accessing Admin Panel
       content.push(
        <NavLink key="dashboard-generic" to="/admin" end className={linkClass} onClick={onClose}>
          <LayoutDashboard size={18} /> Tổng quan
        </NavLink>
      );
  }

  // 2. Evaluations
  // Actually, let's map based on the specific controller capabilities
  // /admin/evaluations -> EvaluationController (likely Manage/View All)
  // Let's assume "SYSTEM_ADMIN" or "EVAL_MANAGE" required.
  // Check the sidebar in screenshot: "Đánh giá"
  
  // NOTE: For safety, I will only show these if user has explicit Admin permissions or Role=Admin.
  
  // Permission Mapping:
  // /admin/evaluations -> ??? (Maybe missing code, let's use SYSTEM_ADMIN for now or check if EVAL_HISTORY_VIEW is appropriate for Admin view)
  // Actually, let's look at what permissions exist.
  // USER_VIEW, USER_MANAGE
  // CLASS_MANAGE, CLASS_VIEW_LIST
  // SEM_MANAGE
  // DEPT_MANAGE
  // QUESTION_MANAGE
  // PERMISSION_MANAGE
  
  // Evaluatons? Maybe "LECTURER_EVAL_STUDENT"?
  
  const canViewEvaluations = role === "ADMIN" || role === "SUPPER_ADMIN" || check("SYSTEM_ADMIN"); // Or specific
  if (canViewEvaluations) {
      content.push(
        <NavLink key="evals" to="/admin/evaluations" className={linkClass} onClick={onClose}>
          <CheckSquare size={18} /> Đánh giá
        </NavLink>
      );
  }

  if (check("QUESTION_MANAGE")) {
      content.push(
        <NavLink key="questions" to="/admin/questions" className={linkClass} onClick={onClose}>
          <HelpCircle size={18} /> Câu hỏi
        </NavLink>
      );
      content.push(
        <NavLink key="answers" to="/admin/answers" className={linkClass} onClick={onClose}>
          <FileText size={18} /> Đáp án
        </NavLink>
      );
  }

  if (check("USER_VIEW") || check("USER_MANAGE")) {
      content.push(
        <NavLink key="users" to="/admin/users" className={linkClass} onClick={onClose}>
          <Users size={18} /> Người dùng
        </NavLink>
      );
  }
  
  // Accounts (Seems redundant with Users, but in screenshot)
  if (check("USER_MANAGE") || role === "ADMIN" || role === "SUPPER_ADMIN") {
      content.push(
        <NavLink key="accounts" to="/admin/acounts" className={linkClass} onClick={onClose}>
          <Users size={18} /> Tài khoản
        </NavLink>
      );
  }

  if (content.length > 0) {
      content.push(<div key="divider" className="border-t my-2 border-gray-200"></div>);
  }

  if (check("SEM_MANAGE")) {
      content.push(
        <NavLink key="semesters" to="/admin/semesters" className={linkClass} onClick={onClose}>
          <BookOpen size={18} /> Học kỳ
        </NavLink>
      );
  }

  if (check("DEPT_MANAGE")) {
      content.push(
        <NavLink key="depts" to="/admin/departments" className={linkClass} onClick={onClose}>
          <Building size={18} /> Khoa
        </NavLink>
      );
  }

  if (check("CLASS_MANAGE") || check("CLASS_VIEW_LIST")) {
       content.push(
        <NavLink key="classes" to="/admin/classes" className={linkClass} onClick={onClose}>
          <GraduationCap size={18} /> Lớp
        </NavLink>
      );
  }

  if (check("PERMISSION_MANAGE")) {
       content.push(
        <NavLink key="perms" to="/admin/permissions" className={linkClass} onClick={onClose}>
          <Shield size={18} /> Phân quyền
        </NavLink>
      );
  }

  // ✅ RETURN TO HOME (For Hybrid Users)
  // If user is NOT a pure Admin (meaning they have a User Dashboard to go back to)
  // OR even if they are Admin, maybe they want to see the landing page?
  // Let's show it for everyone for flexibility.
  content.push(<div key="divider-exit" className="border-t my-2 border-gray-200"></div>);
  content.push(
    <NavLink key="home-return" to="/" className={linkClass} onClick={onClose}>
       <Home size={18} /> Về trang chủ
    </NavLink>
  );

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
          fixed lg:sticky top-0 left-0 z-[100] h-screen w-56 flex-shrink-0 bg-white shadow-lg p-3 overflow-y-auto transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-purple-600">ADMIN PANEL</h2>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <nav className="space-y-1.5">
          {content}
        </nav>
      </aside>
    </>
  );
}
