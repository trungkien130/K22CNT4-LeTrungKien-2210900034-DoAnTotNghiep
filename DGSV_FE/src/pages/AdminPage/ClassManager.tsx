import { useEffect, useState } from "react";
import api from "../../API/api";
import { Trash2, Edit, Plus } from "lucide-react";

export default function ClassManager() {
  const [data, setData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  
  // Default form state
  const [form, setForm] = useState({ 
    name: "", 
    courseId: "", 
    departmentId: 0,
    isActive: true 
  });

  const fetchData = async () => {
    try {
        const [resClasses, resDepts] = await Promise.all([
            api.getClassesList(),
            api.getDepartments()
        ]);
        setData(resClasses.data);
        setDepartments(resDepts.data);
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
        await api.updateClass(editing.id, form);
      } else {
        await api.createClass(form);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ name: "", courseId: "", departmentId: 0, isActive: true });
      fetchData();
    } catch (err) {
      alert("Lỗi lưu dữ liệu");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa lớp này?")) return;
    try {
      await api.deleteClass(id);
      fetchData();
    } catch (err) {
      alert("Lỗi xóa dữ liệu");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Quản lý Lớp</h2>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: "", courseId: "", departmentId: departments[0]?.id || 0, isActive: true });
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
              <th className="px-6 py-3 text-left">Tên Lớp</th>
              <th className="px-6 py-3 text-left">Khóa</th>
              <th className="px-6 py-3 text-left">Khoa</th>
              <th className="px-6 py-3 text-center">Trạng thái</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">{item.id}</td>
                <td className="px-6 py-4 font-medium">{item.name}</td>
                <td className="px-6 py-4">{item.courseId}</td>
                <td className="px-6 py-4">{item.departmentName}</td>
                <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditing(item);
                      setForm({
                        name: item.name,
                        courseId: item.courseId,
                        departmentId: item.departmentId,
                        isActive: item.isActive
                      });
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
              {editing ? "Sửa Lớp" : "Thêm Lớp"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên Lớp</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Khóa (vd: K22)</label>
                <input
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Khoa</label>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: Number(e.target.value) })}
                  className="w-full border p-2 rounded"
                >
                    <option value={0}>-- Chọn Khoa --</option>
                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({...form, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-sm font-medium">Hoạt động</label>
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
