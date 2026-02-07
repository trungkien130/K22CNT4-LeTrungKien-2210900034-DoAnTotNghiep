import { useState } from "react";
import api from "../API/api";
import type { Role, UserInfo } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  userInfo: UserInfo;
  role: Role;
  onSaved: () => void;
}

export function EditUserModal({
  open,
  onClose,
  userInfo,
  role,
  onSaved,
}: Props) {
  const [form, setForm] = useState({
    fullName: userInfo.fullName,
    email: userInfo.email ?? "",
    phone: userInfo.phone ?? "",
    birthday: userInfo.birthday ?? "", 
    gender: typeof userInfo.gender === 'boolean' ? userInfo.gender : (userInfo.gender === "Nam" ? true : userInfo.gender === "Nữ" ? false : undefined),
  });

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      // Build payload conditionally based on role
      // Lecturer model doesn't have Gender field, so exclude it
      const payload: any = {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          birthday: form.birthday,
          isActive: userInfo.isActive, // ✅ Preserve active status
      };
      
      // Only include gender for STUDENT role (Lecturer model doesn't have this field)
      if (role === "STUDENT") {
          payload.gender = form.gender;
      }
      
      await api.updateUser(role, userInfo.id, payload);
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 transform transition-all">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">✏️ Sửa thông tin cá nhân</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                 <Input
                    label="Họ và tên"
                    value={form.fullName}
                    onChange={(v) => setForm({ ...form, fullName: v })}
                  />
            </div>
            
            <Input
              label="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              type="email"
            />
            <Input
              label="Số điện thoại"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              type="tel"
            />
            
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Ngày sinh</label>
                <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={form.birthday ? new Date(form.birthday).toISOString().split('T')[0] : ""}
                    onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Giới tính</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={form.gender === true ? "true" : form.gender === false ? "false" : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, gender: val === "true" ? true : val === "false" ? false : undefined });
                  }}
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="true">Nam</option>
                  <option value="false">Nữ</option>
                </select>
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== INPUT ===== */
function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Nhập ${label.toLowerCase()}`}
      />
    </div>
  );
}
