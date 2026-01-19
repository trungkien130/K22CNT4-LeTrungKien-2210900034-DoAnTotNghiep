import { useState, useEffect } from "react";
import api from "../API/api";
import { Check, Shield, AlertCircle } from "lucide-react";


interface RoleObj {
  id: number;
  roleName: string;
}

interface Permission {
  id: number;
  permissionCode: string;
  permissionName: string;
  module: string;
}

export default function PermissionManager() {
  const [roles, setRoles] = useState<RoleObj[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [roleRes, permRes] = await Promise.all([
        api.getRoles(),
        api.getAllPermissions(),
      ]);
      setRoles(roleRes.data);
      setPermissions(permRes.data);
      if (roleRes.data.length > 0) {
        setSelectedRole(roleRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch initial data", err);
    }
  };

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  const fetchRolePermissions = async (roleId: number) => {
    setLoading(true);
    try {
      const res = await api.getRolePermissions(roleId);
      // API returns list of Permission Objects, we just need IDs
      setRolePermissions(res.data.map((p: any) => p.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permId: number) => {
    setRolePermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      await api.assignPermissions(selectedRole, rolePermissions);
      setMessage("Cập nhật quyền thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Lỗi khi lưu quyền.");
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by Module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Create translation map
  const moduleTranslations: Record<string, string> = {
    "USER MANAGEMENT": "QUẢN LÝ NGƯỜI DÙNG",
    "CLASS MANAGEMENT": "QUẢN LÝ LỚP HỌC",
    "DEPARTMENT MANAGEMENT": "QUẢN LÝ KHOA",
    "SEMESTER MANAGEMENT": "QUẢN LÝ HỌC KỲ",
    "EVALUATION": "ĐÁNH GIÁ RÈN LUYỆN",
    "LECTURER": "GIẢNG VIÊN",
    "SYSTEM": "HỆ THỐNG",  // Fallback for generic
  };
  // Permission Code Translation Map
  const permissionCodeTranslations: Record<string, string> = {
    // User
    "USER_VIEW": "Xem danh sách người dùng",
    "USER_MANAGE": "Quản lý người dùng (Thêm/Sửa/Xóa)",
    
    // Class
    "CLASS_VIEW_LIST": "Xem danh sách lớp",
    "CLASS_MANAGE": "Quản lý lớp học",
    
    // Lecturer
    "LECTURER_VIEW_CLASSES": "Xem lớp được phân công",
    "LECTURER_EVAL_STUDENT": "Đánh giá sinh viên",
    
    // Semester
    "SEM_MANAGE": "Quản lý học kỳ",
    
    // Permission
    "PERMISSION_MANAGE": "Quản lý phân quyền",

    // Evaluation
    "EVAL_SELF": "Tự đánh giá",
    "EVAL_HISTORY_VIEW": "Xem lịch sử đánh giá",

    // System/General
    "SYSTEM_ADMIN": "Quản trị hệ thống",
    "DEPT_MANAGE": "Quản lý Khoa/Bộ môn",
    "QUESTION_MANAGE": "Quản lý Ngân hàng câu hỏi",
    "ANSWER_MANAGE": "Quản lý Bộ câu trả lời (Scores)",
    
    // Monitors
    "CLASS_MONITOR": "Lớp trưởng (Xem đánh giá lớp)",
  };

  // Role Name Translation Map
  const roleTranslations: Record<string, string> = {
    "ADMIN": "Quản trị viên",
    "LECTURER": "Giảng viên",
    "STUDENT": "Sinh viên",
    "SUPPER_ADMIN": "Quản trị cấp cao", // Handling the typo from DB
    "SUPER_ADMIN": "Quản trị cấp cao",
    "VPK": "Văn phòng khoa",
  };

  const handleAddRole = async () => {
    const roleName = prompt("Nhập tên vai trò mới:");
    if (!roleName) return;

    // Basic check
    if (roles.some(r => r.roleName.toLowerCase() === roleName.toLowerCase())) {
        alert("Vai trò đ tồn tại!");
        return;
    }

    try {
        await api.createRole(roleName);
        setMessage("Thêm vai trò mới thành công!");
        fetchInitialData(); // Refresh list
    } catch (err) {
        console.error(err);
        alert("Có lỗi khi thêm vai trò (hoặc bạn không có quyền)");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          Phân Quyền Hệ Thống
        </h1>
        {message && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg animate-fade-in">
            <Check className="w-4 h-4" />
            {message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* LEFT: ROLES */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
             <h2 className="font-semibold text-gray-700">Vai trò (Roles)</h2>
             <button 
                onClick={handleAddRole}
                title="Thêm vai trò mới"
                className="p-1 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
             >
                <div className="w-5 h-5 flex items-center justify-center font-bold text-lg leading-none">+</div>
             </button>
          </div>
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                  selectedRole === role.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                {roleTranslations[role.roleName] || role.roleName}
                {selectedRole === role.id && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: PERMISSIONS */}
        <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-gray-700">Danh sách quyền hạn</h2>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(groupedPermissions).map(([module, perms]) => (
              <div key={module} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <h3 className="text-sm font-bold text-blue-700 uppercase mb-3 tracking-wider border-b pb-2">
                  {moduleTranslations[module?.trim().toUpperCase()] || module}
                </h3>
                <div className="space-y-3">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-start gap-3 p-2 hover:bg-white rounded-md cursor-pointer transition-colors"
                    >
                      <div className="relative flex items-center mt-0.5">
                        <input
                          type="checkbox"
                          className="w-5 h-5 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                          checked={rolePermissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {permissionCodeTranslations[perm.permissionCode] || perm.permissionName}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          {perm.permissionCode}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {permissions.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              Chưa có dữ liệu quyền hạn
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
