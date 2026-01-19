import { useEffect, useState } from "react";
import api from "../API/api";
import type { UserAdmin } from "../types";
import { formatDate } from "../utils/dateUtils";
import { Eye } from "lucide-react";
import EvaluationDetailModal from "./EvaluationDetailModal";
import { hasPermission } from "../utils/permissionUtils";

interface StudentListProps {
  className: string;
}

export default function StudentList({ className }: StudentListProps) {
  const [students, setStudents] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<UserAdmin | null>(null);

  // User Permissions
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const canViewDetail = currentUser?.role === "LECTURER" || hasPermission(currentUser, "CLASS_MONITOR");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Use the new endpoint optimized for fetching students by class
        // This avoids 403 Forbidden errors since it doesn't require Admin permissions
        const res = await api.getStudentsByClass(className);
        setStudents(res.data || []);
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setLoading(false);
      }
    };

    if (className) {
      fetchStudents();
    }
  }, [className]);

  if (loading) return <div className="p-4 text-center">Đang tải danh sách lớp...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-700">Danh sách sinh viên lớp {className}</h3>
        <span className="text-sm text-gray-500 font-medium">Tổng số sinh viên: {students.length}</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-3 font-semibold">STT</th>
              <th className="px-6 py-3 font-semibold">Mã SV</th>
              <th className="px-6 py-3 font-semibold">Họ và tên</th>
              <th className="px-6 py-3 font-semibold">Ngày sinh</th>
              <th className="px-6 py-3 font-semibold">Giới tính</th>
              <th className="px-6 py-3 font-semibold">Trạng thái</th>
              {canViewDetail && <th className="px-6 py-3 font-semibold text-center">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length > 0 ? (
              students.map((student, index) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-6 py-3 font-medium text-gray-700">{student.id}</td>
                  <td className="px-6 py-3 font-medium text-blue-600">{student.fullName}</td>
                  <td className="px-6 py-3 text-gray-600">{formatDate(student.birthday)}</td>
                  <td className="px-6 py-3 text-gray-600">
                    {student.gender === true || String(student.gender) === "Nam" ? "Nam" : "Nữ"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        student.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {student.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  {canViewDetail && (
                      <td className="px-6 py-3 text-center">
                          <button 
                            onClick={() => setSelectedStudent(student)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                            title="Xem chi tiết đánh giá"
                          >
                              <Eye size={18} />
                          </button>
                      </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canViewDetail ? 7 : 6} className="px-6 py-8 text-center text-gray-500 italic">
                  Chưa có sinh viên nào trong danh sách.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedStudent && (
          <EvaluationDetailModal 
            studentMssv={(selectedStudent as any).userName || String(selectedStudent.id)}
            studentName={selectedStudent.fullName}
            onClose={() => setSelectedStudent(null)}
          />
      )}
    </div>
  );
}
