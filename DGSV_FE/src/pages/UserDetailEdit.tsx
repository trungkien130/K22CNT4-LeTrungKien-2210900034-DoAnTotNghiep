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
  });

  if (!open) return null;

  const handleSave = async () => {
    await api.updateUser(role, userInfo.id, form);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">✏️ Sửa thông tin cá nhân</h3>

        <Input
          label="Họ và tên"
          value={form.fullName}
          onChange={(v) => setForm({ ...form, fullName: v })}
        />
        <Input
          label="Email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
        <Input
          label="Số điện thoại"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose}>Hủy</button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Lưu
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
    <div className="mb-3">
      <label className="text-sm text-gray-500">{label}</label>
      <input
        type={type}
        className="w-full border rounded px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
