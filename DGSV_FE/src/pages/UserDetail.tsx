import { useEffect, useState } from "react";
import type { User, UserInfo } from "../types";
import api from "../API/api";
import { EditUserModal } from "./UserDetailEdit";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { formatDate } from "../utils/dateUtils";

interface UserDetailProps {
  user: User;
}

export default function UserDetail({ user }: UserDetailProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [openChangePass, setOpenChangePass] = useState(false);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = user.userId ?? user.mssv;
      if (!userId) {
        setError("Không xác định được ID người dùng");
        return;
      }

      const res = await api.getUserInfo(user.role, String(userId));
      setUserInfo(res.data);
    } catch {
      setError("Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [user]);

  const getPositionLabel = (info: UserInfo) => {
    const pos = info.position?.toLowerCase();
    if (pos === "lt") return "Lớp trưởng";
    if (pos === "sv") return "Sinh viên";
    if (pos === "gv") return "Giảng viên";
    if (info.position) return info.position;
    
    // Fallback based on role
    if (user.role === "STUDENT") return "Sinh viên";
    if (user.role === "LECTURER") return "Giảng viên";
    return "Quản trị viên";
  };

  const getGenderLabel = (gender?: boolean | string | null) => {
    if (gender === true || gender === "Nam") return "Nam";
    return "Nữ";
  };

  if (loading)
    return <p className="text-center">Đang tải thông tin người dùng...</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (!userInfo) return null;

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 font-sans">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-l-4 border-blue-600 pl-4">
        Thông tin cá nhân
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-0 translate-x-10 -translate-y-10"></div>
        
        <Field label="Họ và tên" value={userInfo.fullName} isHighlight />
        <Field label="Mã sinh viên" value={user.mssv || String(user.userId) || "N/A"} />
        <Field label="Ngày sinh" value={formatDate(userInfo.birthday)} />
        <Field label="Email" value={userInfo.email ?? "Chưa cập nhật"} />
        <Field
          label="Số điện thoại"
          value={userInfo.phone ?? "Chưa cập nhật"}
        />

        {(userInfo.gender !== null && userInfo.gender !== undefined) && (
             <Field label="Giới tính" value={getGenderLabel(userInfo.gender)} />
        )}
        {userInfo.department && (
          <Field label="Khoa" value={userInfo.department} />
        )}
        {userInfo.className && <Field label="Lớp" value={userInfo.className} />}
        {userInfo.course && <Field label="Khóa học" value={userInfo.course} />}
        <Field 
          label="Chức vụ" 
          value={getPositionLabel(userInfo)} 
        />
        {/* TRẠNG THÁI */}
        <div className="md:col-span-2 pt-4 border-t border-gray-100 flex justify-between items-center z-10 relative">
            <div>
              <p className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">Trạng thái</p>
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                  userInfo.isActive
                    ? "bg-green-100 text-green-700 ring-1 ring-green-600/20"
                    : "bg-red-100 text-red-700 ring-1 ring-red-600/20"
                }`}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${userInfo.isActive ? "bg-green-600" : "bg-red-600"}`}></span>
                {userInfo.isActive ? "Hoạt động" : "Bị khóa"}
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                  onClick={() => setOpenChangePass(true)}
                  className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 flex items-center gap-2 transform active:scale-95"
              >
                  <span className="text-lg">🔒</span> Đổi mật khẩu
              </button>
              <button
                  onClick={() => setOpenEdit(true)}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center gap-2 transform active:scale-95"
              >
                  <span className="text-lg">✎</span> Sửa thông tin
              </button>
            </div>
        </div>
      </div>

      {/* ===== MODAL SỬA (FILE RIÊNG) ===== */}
      <EditUserModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        userInfo={userInfo}
        role={user.role}
        onSaved={fetchUserInfo}
      />
      <ChangePasswordModal
        open={openChangePass}
        onClose={() => setOpenChangePass(false)}
        role={user.role}
        userId={user.userId ?? user.mssv ?? ""}
      />
    </div>
  );
}

/* ===== FIELD ===== */
function Field({ label, value, isHighlight }: { label: string; value: string; isHighlight?: boolean }) {
  return (
    <div className="z-10 relative animate-fadeIn">
      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-medium ${isHighlight ? "text-blue-900 text-xl font-bold" : "text-gray-700"}`}>
        {value}
      </p>
    </div>
  );
}
