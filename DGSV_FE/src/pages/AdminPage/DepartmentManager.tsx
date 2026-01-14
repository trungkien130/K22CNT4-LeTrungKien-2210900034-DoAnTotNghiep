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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Quản lý Khoa</h2>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: "" });
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={18} /> Thêm mới
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Tên Khoa</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">{item.id}</td>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditing(item);
                      setForm(item);
                      setModalOpen(true);
                    }}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
