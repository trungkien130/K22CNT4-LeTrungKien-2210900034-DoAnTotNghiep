import { useEffect, useState } from "react";
import api from "../API/api";
import { type Semester } from "../types";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { formatDate } from "../utils/dateUtils";
import { getSemesterStatusInfo } from "../utils/semesterUtils";

export default function Dashboard() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await api.getSemesters();
        setSemesters(res.data || []);
      } catch (error) {
        console.error("Failed to fetch semesters", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSemesters();
  }, []);

  const activeSemesters = semesters.filter(s => s.isActive);
  const otherSemesters = semesters.filter(s => !s.isActive).slice(0, 3); // Show max 3 recent closed

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Tổng quan hệ thống</h2>

      {/* Active Semesters Section */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
           <span className="w-2 h-8 bg-blue-600 rounded-sm"></span>
           Học kỳ đang mở
        </h3>
        
        {activeSemesters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSemesters.map(sem => {
              const status = getSemesterStatusInfo(sem);
              return (
                <div 
                  key={sem.id} 
                  onClick={() => navigate('/selfEvaluation', { state: { semesterId: sem.id } })}
                  className={`bg-white rounded-2xl p-6 shadow-sm border-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${status.border} group`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                      {status.icon} {status.label}
                    </div>
                    {status.urgent && <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></span>}
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{sem.name}</h4>
                  <p className="text-gray-500 text-sm mb-4">Năm học: {sem.schoolYear}</p>
                  
                  <div className="flex items-center text-sm text-gray-600 gap-4 mb-4">
                    <div className="flex flex-col">
                       <span className="text-xs text-gray-400">Ngày bắt đầu</span>
                       <span className="font-medium">{formatDate(sem.dateOpenStudent)}</span>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="flex flex-col">
                       <span className="text-xs text-gray-400">Ngày kết thúc</span>
                       <span className="font-medium">{formatDate(sem.dateEndStudent)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-blue-600">
                    <span className="font-medium">Đánh giá ngay</span>
                    <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-500 border border-dashed border-gray-300">
            Hiện không có học kỳ nào đang mở cho sinh viên.
          </div>
        )}
      </div>

      {/* Recent/Other Semesters */}
      {otherSemesters.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Học kỳ gần đây</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-75 hover:opacity-100 transition-opacity">
            {otherSemesters.map(sem => (
              <div 
                 key={sem.id}
                 onClick={() => navigate('/history')}
                 className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-gray-300 transition"
              >
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Đã đóng</span>
                 </div>
                 <h5 className="font-bold text-gray-700">{sem.name}</h5>
                 <p className="text-sm text-gray-500">{sem.schoolYear}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
