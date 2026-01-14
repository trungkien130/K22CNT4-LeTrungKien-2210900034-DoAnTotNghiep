import { useEffect, useState } from "react";
import type { User, UserInfo } from "../types";
import api from "../API/api";
import { EditUserModal } from "./UserDetailEdit";

interface UserDetailProps {
  user: User;
}

export default function UserDetail({ user }: UserDetailProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openEdit, setOpenEdit] = useState(false);

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

  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa cập nhật";

  if (loading)
    return <p className="text-center">Đang tải thông tin người dùng...</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (!userInfo) return null;

  return (
    <div className="max-w-6xl mx-auto mt-14 px-4">
      <h2 className="text-3xl font-bold mb-8">Thông tin cá nhân</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-10 rounded-2xl shadow-lg">
        <Field label="Họ và tên" value={userInfo.fullName} />
        <Field label="Mã sinh viên" value={String(userInfo.id)} />
        <Field label="Ngày sinh" value={formatDate(userInfo.birthday)} />
        <Field label="Email" value={userInfo.email ?? "Chưa cập nhật"} />
        <Field
          label="Số điện thoại"
          value={userInfo.phone ?? "Chưa cập nhật"}
        />

        {userInfo.gender && <Field label="Giới tính" value={userInfo.gender} />}
        {userInfo.department && (
          <Field label="Khoa" value={userInfo.department} />
        )}
        {userInfo.className && <Field label="Lớp" value={userInfo.className} />}
        {userInfo.course && <Field label="Khóa học" value={userInfo.course} />}
        {userInfo.position && (
          <Field label="Chức vụ" value={userInfo.position} />
        )}

        {/* TRẠNG THÁI */}
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500 mb-2">Trạng thái</p>
          <span
            className={`px-4 py-2 rounded-full font-medium ${
              userInfo.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {userInfo.isActive ? "Hoạt động" : "Bị khóa"}
          </span>
        </div>

        {/* NÚT SỬA */}
        <div className="md:col-span-2 flex justify-end">
          <button
            onClick={() => setOpenEdit(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ✏️ Sửa thông tin
          </button>
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
    </div>
  );
}

/* ===== FIELD ===== */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-lg text-gray-800">{value}</p>
    </div>
  );
}
