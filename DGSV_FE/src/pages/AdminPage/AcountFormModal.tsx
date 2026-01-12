import { useState } from "react";
import type { Account, EditForm, Role } from "../../types";

interface Props {
  open: boolean;
  role: Role;
  editing?: Account | null;
  form: EditForm;
  setForm: React.Dispatch<React.SetStateAction<EditForm>>;
  onSave: (newPassword?: string) => void;
  onClose: () => void;
}

export default function AccountFormModal({
  open,
  role,
  editing,
  form,
  setForm,
  onSave,
  onClose,
}: Props) {
  const [newPassword, setNewPassword] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">
          {editing ? "Sửa tài khoản" : "Tài khoản"}
        </h3>

        <div className="mb-4">
          <label className="block mb-1 font-medium">UserName</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={form.userName}
            onChange={(e) => setForm({ ...form, userName: e.target.value })}
          />
        </div>

        {role === "ADMIN" && (
          <div className="mb-4">
            <label className="block mb-1 font-medium">Họ tên</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 font-medium">
            Mật khẩu mới{" "}
            <span className="text-sm text-gray-500">(nếu đổi)</span>
          </label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Để trống nếu không đổi"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-medium">Trạng thái</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.isActive ? "1" : "0"}
            onChange={(e) =>
              setForm({ ...form, isActive: e.target.value === "1" })
            }
          >
            <option value="1">Hoạt động</option>
            <option value="0">Khóa</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setNewPassword("");
              onClose();
            }}
            className="px-4 py-2 rounded border"
          >
            Hủy
          </button>

          <button
            onClick={() => {
              onSave(newPassword || undefined);
              setNewPassword("");
            }}
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
