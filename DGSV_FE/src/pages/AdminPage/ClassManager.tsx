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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
              {editing ? "Sửa Lớp" : "Thêm Lớp"}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Tên Lớp</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Nhập tên lớp..."
                />
              </div>
              
              <div>
                <label className="block text-gray-600 font-medium mb-2">Khóa (vd: K22)</label>
                <input
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Nhập khóa..."
                />
              </div>
              
              <div>
                <label className="block text-gray-600 font-medium mb-2">Khoa</label>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                >
                    <option value={0}>-- Chọn Khoa --</option>
                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 font-medium">
                    <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={form.isActive}
                        onChange={(e) => setForm({...form, isActive: e.target.checked})}
                    />
                    Hoạt động
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
                  >
                    Lưu
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
