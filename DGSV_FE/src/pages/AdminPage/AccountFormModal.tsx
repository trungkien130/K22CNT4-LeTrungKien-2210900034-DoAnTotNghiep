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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          {editing ? "Sửa tài khoản" : "Thêm tài khoản"}
        </h2>

        {/* Form Body */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-600 font-medium mb-2">Username</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Nhập tên đăng nhập..."
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
            />
          </div>

          <div>
             <label className="block text-gray-600 font-medium mb-2">
                {editing ? "Mật khẩu mới (bỏ trống nếu không đổi)" : "Mật khẩu"}
             </label>
             <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder={editing ? "" : "Nhập mật khẩu..."}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-2">
            {editing && (
                 <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 font-medium">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    Hoạt động
                </label>
            )}

            <div className={`flex gap-3 ${!editing ? 'ml-auto' : ''}`}>
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
