import type { UserForm } from "../../types";

interface Props {
  open: boolean;
  editing: any | null;
  form: UserForm;
  setForm: React.Dispatch<React.SetStateAction<UserForm>>;
  onSave: () => void;
  onClose: () => void;
}

export default function UserFormModal({
  open,
  form,
  setForm,
  onSave,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 relative">
        {/* Title */}
        <h3 className="text-2xl font-semibold text-gray-800 text-center">
          Cập nhật người dùng
        </h3>

        {/* Họ tên */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Họ tên</label>
          <input
            type="text"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Họ tên"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="SĐT"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="status"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="w-5 h-5 accent-blue-600"
          />
          <label htmlFor="status" className="font-medium text-gray-700">
            Hoạt động
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
