import { useEffect, useState } from "react";
import api from "../../API/api";
import { Trash2, Edit, Plus } from "lucide-react";

interface Semester {
    id?: number;
    name: string;
    schoolYear: string;
    dateOpenStudent?: string | null;
    dateEndStudent?: string | null;
    dateEndClass?: string | null;
    dateEndLecturer?: string | null;
    isActive: boolean;
}

export default function SemesterManager() {
  const [data, setData] = useState<Semester[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);
  
  // Use a strictly defined initial state to avoid uncontrolled input warnings
  const [form, setForm] = useState<Semester>({
      name: "",
      schoolYear: "",
      dateOpenStudent: "",
      dateEndStudent: "",
      dateEndClass: "",
      dateEndLecturer: "",
      isActive: false
  });

  const fetchData = async () => {
    try {
        const res = await api.getSemesters();
        if (res && res.data) {
            setData(res.data);
        }
    } catch (err) {
        console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      // 1. Sanitize Payload: Convert empty strings to null for dates to avoid 400 Bad Request
      const payload = {
        name: form.name,
        schoolYear: form.schoolYear,
        dateOpenStudent: form.dateOpenStudent || null,
        dateEndStudent: form.dateEndStudent || null,
        dateEndClass: form.dateEndClass || null,
        dateEndLecturer: form.dateEndLecturer || null,
        isActive: form.isActive
      };

      if (editing && editing.id) {
        // Update
        await api.updateSemester(editing.id, payload);
      } else {
        // Create
        await api.createSemester(payload);
      }
      
      setModalOpen(false);
      setEditing(null);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error("Save Error:", err.response?.data || err.message);
      alert("Lỗi lưu dữ liệu: " + (err.response?.data?.title || "Vui lòng kiểm tra lại thông tin."));
    }
  };

  const resetForm = () => {
      setForm({
        name: "",
        schoolYear: "",
        dateOpenStudent: "",
        dateEndStudent: "",
        dateEndClass: "",
        dateEndLecturer: "",
        isActive: false
      });
  }

  const handleDelete = async (id?: number) => {
    if (!id || !confirm("Xóa học kỳ này?")) return;
    try {
      await api.deleteSemester(id);
      fetchData();
    } catch (err) {
      alert("Lỗi xóa dữ liệu");
    }
  };

  const formatDate = (dateString?: string | null) => {
      if (!dateString) return "—";
      return new Date(dateString).toLocaleDateString("vi-VN");
  }

  // Helper for input date value (YYYY-MM-DD)
  // Ensures we always return a string (never null/undefined) to input value
  const toInputDate = (dateString?: string | null) => {
      if (!dateString) return "";
      try {
        return new Date(dateString).toISOString().split('T')[0];
      } catch (e) {
          return "";
      }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Học kỳ</h2>
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
        >
          <Plus size={20} /> Thêm mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
            <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">ID</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Tên Học kỳ</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Năm học</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600">Mở SV</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600">Đóng SV</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600">Đóng Lớp</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600">Đóng GV</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600">Trạng thái</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-500">{item.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.schoolYear}</td>
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">{formatDate(item.dateOpenStudent)}</td>
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">{formatDate(item.dateEndStudent)}</td>
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">{formatDate(item.dateEndClass)}</td>
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">{formatDate(item.dateEndLecturer)}</td>
                    <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isActive 
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                            {item.isActive ? "Active" : "Locked"}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                    <button
                        onClick={() => {
                        setEditing(item);
                        setForm({
                            name: item.name || "",
                            schoolYear: item.schoolYear || "",
                            // Ensure properties exist to prevent uncontrolled behavior if backend sends incomplete object
                            dateOpenStudent: item.dateOpenStudent || "",
                            dateEndStudent: item.dateEndStudent || "",
                            dateEndClass: item.dateEndClass || "",
                            dateEndLecturer: item.dateEndLecturer || "",
                            isActive: item.isActive || false,
                        });
                        setModalOpen(true);
                        }}
                        className="text-blue-600 hover:bg-blue-100 p-2 rounded transition"
                        title="Sửa"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                         onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:bg-red-100 p-2 rounded transition"
                        title="Xóa"
                    >
                        <Trash2 size={18} />
                    </button>
                    </td>
                </tr>
                ))}
                {data.length === 0 && (
                    <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">Chưa có dữ liệu học kỳ</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
              {editing ? "✏️ Cập nhật Học kỳ" : "✨ Thêm Học kỳ mới"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Basic Info */}
                 <div className="space-y-4">
                    <h4 className="font-semibold text-blue-600 border-b border-blue-100 pb-1">Thông tin chung</h4>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên Học kỳ <span className="text-red-500">*</span></label>
                        <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="VD: Học kỳ 1"
                        maxLength={50} // Limit length to prevent DB error
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Năm học <span className="text-red-500">*</span></label>
                        <input
                        value={form.schoolYear}
                        onChange={(e) => setForm({ ...form, schoolYear: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="VD: 2023-2024"
                        maxLength={20} // Limit length
                        />
                    </div>
                     <div className="flex items-center gap-3 mt-4 pt-2">
                         <label className="flex items-center gap-3 cursor-pointer">
                             <div className="relative">
                                 <input 
                                     type="checkbox" 
                                     className="sr-only peer"
                                     checked={!!form.isActive} // Ensure boolean
                                     onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                 />
                                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                             </div>
                             <span className="text-sm font-medium text-gray-700">Kích hoạt ngay (IsActive)</span>
                         </label>
                     </div>
                 </div>

                 {/* Dates Info */}
                 <div className="space-y-4">
                     <h4 className="font-semibold text-green-600 border-b border-green-100 pb-1">Thời gian hạn định</h4>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mở cho SV</label>
                            <input
                            type="date"
                            value={toInputDate(form.dateOpenStudent)}
                            onChange={(e) => setForm({ ...form, dateOpenStudent: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đóng cho SV</label>
                            <input
                            type="date"
                            value={toInputDate(form.dateEndStudent)}
                            onChange={(e) => setForm({ ...form, dateEndStudent: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                     </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hạn Lớp trưởng (Đóng Class)</label>
                        <input
                        type="date"
                        value={toInputDate(form.dateEndClass)}
                        onChange={(e) => setForm({ ...form, dateEndClass: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hạn Giảng viên (Đóng Lecturer)</label>
                        <input
                        type="date"
                        value={toInputDate(form.dateEndLecturer)}
                        onChange={(e) => setForm({ ...form, dateEndLecturer: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                 </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg transition transform active:scale-95"
              >
                {editing ? "Lưu thay đổi" : "Lưu học kỳ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
