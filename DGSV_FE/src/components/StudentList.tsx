import { useEffect, useState } from "react";
import api from "../API/api";
import type { UserAdmin, Answer } from "../types";
import { formatDate } from "../utils/dateUtils";
import { Eye } from "lucide-react";
import EvaluationDetailModal from "./EvaluationDetailModal";
import { hasPermission } from "../utils/permissionUtils";
import { getGradeInfo } from "../utils/gradeUtils";

interface StudentListProps {
  className: string;
}

interface StudentEvaluationSummary {
  studentId: string | number;
  totalScore: number;
  isEvaluated: boolean;
}

export default function StudentList({ className }: StudentListProps) {
  const [students, setStudents] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Evaluation Data
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<Record<string | number, StudentEvaluationSummary>>({});
  const [flatAnswers, setFlatAnswers] = useState<Record<number, Answer>>({});

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<UserAdmin | null>(null);

  // User Permissions
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const canViewDetail = currentUser?.role === "LECTURER" || hasPermission(currentUser, "CLASS_MONITOR");

  // 1. Fetch Initial Data (Semesters & Answers for calculation)
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [semRes, ansRes] = await Promise.all([
          api.getSemesters(),
          api.getAnswers()
        ]);
        
        const sems = semRes.data || [];
        setSemesters(sems);
        
        // Default to latest semester
        if (sems.length > 0) {
            // Sort by ID desc or use logic to find latest
            const latest = sems.sort((a: any, b: any) => b.id - a.id)[0];
            setSelectedSemester(latest.id);
        }

        // Process Answers
        const answers = ansRes.data || [];
        const flat: Record<number, Answer> = {};
        answers.forEach((a: Answer) => {
           flat[a.id] = a;
        });
        setFlatAnswers(flat);

      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    fetchInit();
  }, []);

  // 2. Fetch Students when Class changes
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Use the new endpoint optimized for fetching students by class
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

  // 3. Fetch Evaluations when Students or Semester changes
  useEffect(() => {
    const fetchEvaluations = async () => {
        if (!selectedSemester || students.length === 0 || Object.keys(flatAnswers).length === 0) return;

        const promises = students.map(student => 
            api.getEvaluation((student as any).userName || student.id, selectedSemester) // Use userName/id consistent with login
               .then(res => ({ studentId: student.id, data: res.data as { answerId: number, count: number }[] }))
               .catch(() => ({ studentId: student.id, data: [] }))
        );

        try {
            const results = await Promise.all(promises);
            const newEvals: Record<string | number, StudentEvaluationSummary> = {};

            results.forEach(({ studentId, data }) => {
                let total = 0;
                const hasData = data && data.length > 0;
                
                if (hasData) {
                    data.forEach(item => {
                        const ans = flatAnswers[item.answerId];
                        if (ans) {
                            if (item.count > 1 && ans.answerScore < 0) {
                                total += ans.answerScore * item.count;
                            } else {
                                total += ans.answerScore;
                            }
                        }
                    });
                    if (total > 100) total = 100;
                    if (total < -100) total = -100;
                }

                newEvals[studentId] = {
                    studentId,
                    totalScore: hasData ? total : 0,
                    isEvaluated: hasData
                };
            });

            setEvaluations(newEvals);

        } catch (error) {
            console.error("Error fetching evaluations", error);
        }
    };

    fetchEvaluations();
  }, [selectedSemester, students, flatAnswers]);


  if (loading) return <div className="p-4 text-center">Đang tải danh sách lớp...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h3 className="font-bold text-gray-700">Danh sách sinh viên lớp {className}</h3>
            <span className="text-sm text-gray-500 font-medium">Tổng số sinh viên: {students.length}</span>
        </div>
        
        {/* Semester Selector */}
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Học kỳ:</label>
            <select 
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                value={selectedSemester || ""}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
            >
                {semesters.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.schoolYear})</option>
                ))}
            </select>
        </div>
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
              <th className="px-6 py-3 font-semibold text-center">Trạng thái ĐG</th>
              <th className="px-6 py-3 font-semibold text-center">Điểm ĐG</th>
              <th className="px-6 py-3 font-semibold text-center">Xếp loại</th>
              {canViewDetail && <th className="px-6 py-3 font-semibold text-center">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length > 0 ? (
              students.map((student, index) => {
                const evalData = evaluations[student.id];
                const isEvaluated = evalData?.isEvaluated;
                const score = evalData?.totalScore || 0;
                const gradeInfo = getGradeInfo(score);

                return (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-6 py-3 font-medium text-gray-700">{student.id}</td>
                  <td className="px-6 py-3 font-medium text-blue-600">{student.fullName}</td>
                  <td className="px-6 py-3 text-gray-600">{formatDate(student.birthday)}</td>
                  <td className="px-6 py-3 text-gray-600">
                    {student.gender === true || String(student.gender) === "Nam" ? "Nam" : "Nữ"}
                  </td>
                  
                  {/* Evaluation Status */}
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isEvaluated ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                        {isEvaluated ? "Đã đánh giá" : "Chưa đánh giá"}
                    </span>
                  </td>

                  {/* Evaluation Score */}
                  <td className={`px-6 py-3 text-center font-bold ${isEvaluated ? (score >= 50 ? 'text-blue-600' : 'text-red-500') : 'text-gray-300'}`}>
                    {isEvaluated ? score : "--"}
                  </td>
                  
                   {/* Grade */}
                   <td className="px-6 py-3 text-center">
                        {isEvaluated ? (
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${gradeInfo.textColor} ${gradeInfo.color}`}>
                                {gradeInfo.letter}
                            </span>
                        ) : (
                            <span className="text-gray-300">-</span>
                        )}
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
              )})
            ) : (
              <tr>
                <td colSpan={canViewDetail ? 9 : 8} className="px-6 py-8 text-center text-gray-500 italic">
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
