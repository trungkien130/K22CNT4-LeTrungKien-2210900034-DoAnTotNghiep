import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Users,
  CheckSquare,
} from "lucide-react";

export default function AdminSidebar() {
  const linkClass = ({ isActive }: any) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <aside className="w-64 bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold mb-6 text-purple-600">ADMIN PANEL</h2>

      <nav className="space-y-2">
        <NavLink to="/admin" end className={linkClass}>
          <LayoutDashboard size={20} /> Tổng quan
        </NavLink>

        <NavLink to="/admin/evaluations" className={linkClass}>
          <CheckSquare size={20} /> Đánh giá
        </NavLink>

        <NavLink to="/admin/questions" className={linkClass}>
          <HelpCircle size={20} /> Câu hỏi
        </NavLink>

        <NavLink to="/admin/answers" className={linkClass}>
          <FileText size={20} /> Đáp án
        </NavLink>

        <NavLink to="/admin/users" className={linkClass}>
          <Users size={20} /> Người dùng
        </NavLink>
        <NavLink to="/admin/acounts" className={linkClass}>
          <Users size={20} /> Tài khoản
        </NavLink>
      </nav>
    </aside>
  );
}
