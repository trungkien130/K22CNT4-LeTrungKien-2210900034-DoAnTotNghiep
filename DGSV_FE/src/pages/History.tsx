import { useEffect, useState } from "react";
import { useAuth } from "../hook/useAuth";
import api from "../API/api";
import { Calendar } from "lucide-react";
import { getGradeInfo } from "../utils/gradeUtils";

interface EvaluationHistory {
  semesterId: number;
  semesterName: string;
  schoolYear: string;
  totalScore: number;
  evaluationDate: string;
}

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<EvaluationHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.userId) {
        fetchHistory(user.userId);
    }
  }, [user]);

  const fetchHistory = async (studentId: string | number) => {
    setLoading(true);
    try {
      const res = await api.getEvaluationHistory(studentId);
      setHistory(res.data || []);
    } catch (error) {
      console.error("Error fetching history", error);
    } finally {
      setLoading(false);
    }
  };

  if(!user) return <p className="text-center mt-10">Vui lòng đăng nhập</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Lịch sử Đánh giá Rèn luyện
        </h1>

        {loading ? (
            <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
        ) : history.length === 0 ? (
            <div className="text-center bg-white p-10 rounded-xl shadow">
                <p className="text-gray-500 text-lg">Chưa có dữ liệu đánh giá nào.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {history.map((item) => (
                    <div 
                        key={item.semesterId} 
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                    >
                        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            {/* Left: Info */}
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full relative">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                    {/* Trend Indicator */}
                                    {(() => {
                                        const currentIndex = history.findIndex(h => h.semesterId === item.semesterId);
                                        const prevItem = history[currentIndex + 1]; // Since data is sorted Descending by default in BE (but let's verify)
                                        // BE returns OrderByDescending(x => x.SemesterId). So next item is previous semester.
                                        
                                        if (!prevItem) return null;

                                        const diff = item.totalScore - prevItem.totalScore;
                                        if (diff === 0) return null;

                                        return (
                                            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${diff > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                                                {diff > 0 ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m18 15-6-6-6 6"/></svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m6 9 6 6 6-6"/></svg>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{item.semesterName}</h3>
                                    <p className="text-gray-500 font-medium">Năm học: {item.schoolYear}</p>
                                </div>
                            </div>

                            {/* Right: Score */}
                            <div className="flex flex-col items-end gap-3">
                                {/* Letter Grade Badge */}
                                {(() => {
                                    const grade = getGradeInfo(item.totalScore);
                                    return (
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${grade.color} ${grade.textColor}`}>
                                            <span className="font-bold">{grade.letter}</span>
                                            <div className="h-3 w-[1px] bg-current opacity-50"></div>
                                            <span className="text-sm font-medium">{grade.classification}</span>
                                        </div>
                                    );
                                })()}

                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">Tổng điểm rèn luyện</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className={`text-3xl font-bold ${item.totalScore >= 50 ? 'text-blue-600' : 'text-red-500'}`}>
                                            {item.totalScore}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Status Bar */}
                        <div className={`h-1 w-full ${item.totalScore >= 50 ? 'bg-blue-500' : 'bg-red-500'}`} />
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
