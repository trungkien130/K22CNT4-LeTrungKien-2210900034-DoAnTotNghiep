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
    } catch (err: any) {
        console.error("Error fetching classes:", err);
        if (err.response && err.response.data) {
            alert(`Error: ${err.response.data.message}\nStack: ${err.response.data.stackTrace}`);
        }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
  if (!form.name.trim()) {
    alert("Tên lớp không được để trống");
    return;
  }

  if (form.departmentId === 0) {
    alert("Vui lòng chọn khoa");
    return;
  }

  const payload = {
    ...form,
    courseId: form.courseId.trim() || null
  };

  try {
    if (editing) {
      await api.updateClass(editing.id, payload);
    } else {
      await api.createClass(payload);
    }

    setModalOpen(false);
    setEditing(null);
    setForm({ name: "", courseId: "", departmentId: 0, isActive: true });
    fetchData();
  } catch (err: any) {
    if (err.response?.data) {
      alert(JSON.stringify(err.response.data, null, 2));
    } else {
      alert("Lỗi lưu dữ liệu");
    }
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
    <div className="p-4 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Quản lý Lớp</h2>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: "", courseId: "", departmentId: departments[0]?.id || 0, isActive: true });
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
              <th className="px-3 py-3 text-left font-bold">Tên Lớp</th>
              <th className="px-3 py-3 text-left font-bold">Khóa</th>
              <th className="px-3 py-3 text-left font-bold">Khoa</th>
              <th className="px-3 py-3 text-center w-24 font-bold">Trạng thái</th>
              <th className="px-3 py-3 text-right w-20 font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/50 transition-all duration-150 group">
                <td className="px-3 py-3 font-medium text-gray-900">{item.id}</td>
                <td className="px-3 py-3 font-medium text-gray-700">{item.name}</td>
                <td className="px-3 py-3 text-gray-600">{item.courseId}</td>
                <td className="px-3 py-3 text-gray-600 truncate max-w-[200px]" title={item.departmentName}>
                    {item.departmentName}
                </td>
                <td className="px-3 py-3 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        item.isActive 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
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
                    <td colSpan={6} className="text-center py-8 text-gray-500 text-xs">Không có dữ liệu</td>
                </tr>
            )}
          </tbody>
        </table>
        </div>
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
