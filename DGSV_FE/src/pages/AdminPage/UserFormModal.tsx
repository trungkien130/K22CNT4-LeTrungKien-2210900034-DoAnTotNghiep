import { useEffect, useState } from "react";
import type { UserForm } from "../../types";
import api from "../../API/api";

interface Props {
  open: boolean;
  editing: any | null;
  form: UserForm;
  setForm: React.Dispatch<React.SetStateAction<UserForm>>;
  onSave: () => void;
  onClose: () => void;
  role: string;
}

export default function UserFormModal({
  open,
  editing,
  form,
  setForm,
  onSave,
  onClose,
  role,
}: Props) {
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (open) {
      api.getClasses().then((res) => {
        setClasses(res.data);
      }).catch(err => console.error("Error fetching classes:", err));
    }
  }, [open]);

  if (!open) return null;

  const isStudent = role === "STUDENT" || (!editing && form["role" as keyof UserForm] === "STUDENT");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-8 shadow-2xl relative">
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          {editing ? "Cập nhật người dùng" : "Thêm người dùng mới"}
        </h2>

        {/* Form Body - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Identity Field */}
          {!editing && role !== "ADMIN" && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-600 font-medium mb-2">
                {role === "STUDENT" ? "Mã sinh viên (MSSV)" : "Mã giảng viên (MSGV)"}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder={role === "STUDENT" ? "VD: 22109..." : "VD: GV001..."}
                value={form.entityId || ""}
                onChange={(e) => setForm({ ...form, entityId: e.target.value })}
              />
            </div>
          )}

           {/* Username & Password */}
           {!editing && (
            <>
               <div>
                <label className="block text-gray-600 font-medium mb-2">Username</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  value={form.userName || ""}
                  onChange={(e) => setForm({ ...form, userName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Mật khẩu</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  value={form.password || ""}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Full Name */}
          <div className={`${!editing ? 'md:col-span-2' : ''}`}>
             <label className="block text-gray-600 font-medium mb-2">Họ tên</label>
             <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
          </div>

          {/* Email */}
          <div>
             <label className="block text-gray-600 font-medium mb-2">Email</label>
             <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">Số điện thoại</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">Ngày sinh</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              value={form.birthday ? new Date(form.birthday).toISOString().split('T')[0] : ""}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            />
          </div>

          {/* Gender */}
          {isStudent && (
             <div>
                <label className="block text-gray-600 font-medium mb-2">Giới tính</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
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
          )}

          {/* Class */}
          {isStudent && (
            <div className="md:col-span-2">
               <label className="block text-gray-600 font-medium mb-2">Lớp</label>
               <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                  value={form.classId || ""}
                  onChange={(e) => setForm({ ...form, classId: Number(e.target.value) })}
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 font-medium">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Hoạt động
            </label>

            <div className="flex gap-3">
               <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={onSave}
                  className="px-8 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
                >
                  Lưu
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
