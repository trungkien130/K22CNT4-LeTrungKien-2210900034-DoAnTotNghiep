import { useEffect, useState } from "react";
import api from "../API/api";
import { Users, ChevronRight } from "lucide-react";
import StudentList from "../components/StudentList";

interface ClassItem {
  id: number;
  name: string;
  departmentId?: number;
  description?: string;
}

export default function LecturerClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Fetch all classes
        // Note: Ideally backend should filter "my classes" for lecturer.
        // Falling back to all classes list for now as per plan.
        const res = await api.getClassesList();
        setClasses(res.data || []);
      } catch (error) {
        console.error("Failed to fetch classes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) return <div className="p-8 text-center">Đang tải danh sách lớp...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-blue-600 pl-4">
        Lớp giảng dạy
      </h2>

      {selectedClass ? (
        <div>
          <button 
            onClick={() => setSelectedClass(null)}
            className="mb-4 text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Quay lại danh sách lớp
          </button>
          <StudentList className={selectedClass} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classes.length > 0 ? (
            classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => setSelectedClass(cls.name)}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Users size={20} />
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                  {cls.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Nhấn để xem danh sách
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              Không tìm thấy lớp học nào.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
