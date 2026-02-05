import { useEffect, useState } from "react";
import api from "../../API/api";
import { Trash2, Edit, Plus } from "lucide-react";

export default function DepartmentManager() {
  const [data, setData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "" });

  const fetchData = async () => {
    try {
        const res = await api.getDepartments();
        setData(res.data);
    } catch (err) {
        console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.updateDepartment(editing.id, form);
      } else {
        await api.createDepartment(form);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ name: "" });
      fetchData();
    } catch (err) {
      alert("Lỗi lưu dữ liệu");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa khoa này?")) return;
    try {
      await api.deleteDepartment(id);
      fetchData();
    } catch (err) {
      alert("Lỗi xóa dữ liệu");
    }
  };

  // ================= UI =================
  return (
    <div className="p-4 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Quản lý Khoa</h2>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: "" });
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Thêm mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full whitespace-nowrap text-sm">
          <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b">
            <tr>
              <th className="px-3 py-3 text-left w-16 font-bold">ID</th>
              <th className="px-3 py-3 text-left font-bold">Tên Khoa</th>
              <th className="px-3 py-3 text-right w-20 font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/50 transition-all duration-150 group">
                <td className="px-3 py-3 font-medium text-gray-900">{item.id}</td>
                <td className="px-3 py-3 text-gray-700 font-medium">{item.name}</td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditing(item);
                        setForm(item);
                        setModalOpen(true);
                      }}
                      className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {data.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500 text-xs">Không có dữ liệu</td>
                </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              {editing ? "Sửa Khoa" : "Thêm Khoa"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên Khoa</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
