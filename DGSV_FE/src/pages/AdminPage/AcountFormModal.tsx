interface Props {
  open: boolean;
  editing: any | null;
  form: any;
  setForm: (data: any) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function AccountFormModal({
  open,
  editing,
  form,
  setForm,
  onSave,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[420px] space-y-3">
        <h3 className="font-bold text-lg">
          {editing ? "Sửa tài khoản" : "Thêm tài khoản"}
        </h3>

        <input
          className="border p-2 w-full"
          placeholder="Username"
          value={form.userName}
          onChange={(e) => setForm({ ...form, userName: e.target.value })}
        />

        <input
          type="password"
          className="border p-2 w-full"
          placeholder={
            editing ? "Mật khẩu mới (bỏ trống nếu không đổi)" : "Mật khẩu"
          }
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {editing && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Hoạt động
          </label>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Hủy
          </button>
          <button
            onClick={onSave}
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
