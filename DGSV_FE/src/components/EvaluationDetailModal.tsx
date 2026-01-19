import { useEffect, useState } from "react";
import api from "../API/api";
import type { Question, Answer, Semester } from "../types";
import { X, PenTool, CheckSquare, Calendar } from "lucide-react";

interface EvaluationDetailModalProps {
  studentMssv: string; // The ID of the student being viewed
  studentName: string;
  onClose: () => void;
}

export default function EvaluationDetailModal({ studentMssv, studentName, onClose }: EvaluationDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  // Data State
  const [questions, setQuestions] = useState<Question[]>([]);
  // const [answersMap, setAnswersMap] = useState<Record<number, Answer[]>>({});
  const [evaluations, setEvaluations] = useState<Record<number, { answerId: number, penaltyCount?: number, score: number }>>({});
  const [flatAnswers, setFlatAnswers] = useState<Record<number, Answer>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  // When semester changes, fetch evaluation
  useEffect(() => {
    if (selectedSemester && studentMssv) {
        fetchUserEvaluation(studentMssv, selectedSemester);
    } else {
        setEvaluations({});
    }
  }, [selectedSemester, studentMssv, flatAnswers]); // Add flatAnswers dependency to ensure lookup works

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Parallel fetch: Semesters, Questions, Answers
      const [semRes, qRes, aRes] = await Promise.all([
        api.getSemesters(),
        api.getQuestions(),
        api.getAnswers()
      ]);

      const sems = semRes.data || [];
      setSemesters(sems);
      
      // Select the active semester by default, or the last one
      const active = sems.find((s: Semester) => s.isActive);
      if (active) setSelectedSemester(active.id);
      else if (sems.length > 0) setSelectedSemester(sems[sems.length - 1].id);

      setQuestions(qRes.data || []);

      const answers = aRes.data || [];
      const grouped: Record<number, Answer[]> = {};
      const flat: Record<number, Answer> = {};
      
      answers.forEach((a: Answer) => {
        if (!grouped[a.questionId]) grouped[a.questionId] = [];
        grouped[a.questionId].push(a);
        flat[a.id] = a;
      });
      // setAnswersMap(grouped);
      setFlatAnswers(flat);

    } catch (error) {
      console.error("Error fetching initial data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvaluation = async (studentId: string, semesterId: number) => {
    if (Object.keys(flatAnswers).length === 0) return;
    
    setLoading(true);
    try {
        const res = await api.getEvaluation(studentId, semesterId);
        const data = res.data as { answerId: number, count: number }[];
        
        const newEvals: Record<number, { answerId: number, penaltyCount?: number, score: number }> = {};
        
        data.forEach(item => {
            const ans = flatAnswers[item.answerId];
            if (ans) {
                newEvals[ans.questionId] = {
                    answerId: item.answerId,
                    score: ans.answerScore,
                    penaltyCount: item.count
                };
            }
        });
        setEvaluations(newEvals);
    } catch (error) {
        // console.warn("No evaluation found or error", error);
        setEvaluations({});
    } finally {
        setLoading(false);
    }
};

  const calculateTotal = () => {
    let total = 0;
    Object.values(evaluations).forEach(item => {
        if (item.penaltyCount !== undefined) {
             total += item.score * item.penaltyCount;
        } else {
            total += item.score;
        }
    });
    if (total > 100) return 100;
    if (total < -100) return -100;
    return total;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
           <div>
               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                   <PenTool className="w-5 h-5 text-blue-600" />
                   Chi tiết đánh giá rèn luyện
               </h3>
               <p className="text-sm text-gray-500 mt-1">
                   Sinh viên: <span className="font-semibold text-gray-700">{studentName} ({studentMssv})</span>
               </p>
           </div>
           <button 
             onClick={onClose}
             className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
           >
             <X size={24} />
           </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b flex gap-4 items-center bg-white">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar size={16} /> Học kỳ:
            </label>
            <select
                className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px]"
                value={selectedSemester || ""}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
            >
                {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.schoolYear})</option>
                ))}
            </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <div className="animate-spin w-8 h-8 boundary-border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
                    Đang tải dữ liệu...
                </div>
            ) : Object.keys(evaluations).length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                    <CheckSquare className="w-12 h-12 mb-4 text-gray-300" />
                    <p>Chưa có dữ liệu đánh giá cho học kỳ này.</p>
                 </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((q, index) => {
                        // const qAnswers = answersMap[q.id] || [];
                        const userEval = evaluations[q.id];
                        
                        // Only show answered questions? Or all? 
                        // Admin view shows all but only selected is highlighted.
                        // Let's copy Admin view style but simpler/read-only.
                        
                        return (
                            <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="font-semibold text-gray-800 mb-3 flex gap-2">
                                     <span className="bg-blue-100 text-blue-700 w-6 h-6 flex items-center justify-center rounded-full text-xs flex-shrink-0 mt-0.5">{index + 1}</span>
                                     {q.contentQuestion}
                                </h4>
                                <div className="ml-8 space-y-2">
                                    {/* Display only the selected answer for cleanliness, or all disabled? */}
                                    {/* Let's display ONLY selected answer to keep it compact and "Detail" focused */}
                                    {userEval ? (
                                        (() => {
                                            const ans = flatAnswers[userEval.answerId];
                                            if (!ans) return <p className="text-red-500 italic">Lỗi dữ liệu câu trả lời</p>;
                                            return (
                                                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-4 h-4 rounded-full bg-blue-600 border border-blue-600 flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        </div>
                                                        <span className="font-medium text-gray-800">{ans.contentAnswer}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {userEval.penaltyCount && userEval.penaltyCount > 1 && (
                                                            <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                                                                x{userEval.penaltyCount}
                                                            </span>
                                                        )}
                                                        <span className={`font-bold ${userEval.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {userEval.score > 0 ? '+' : ''}{userEval.score * (userEval.penaltyCount || 1)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Chưa đánh giá mục này</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t rounded-b-2xl flex justify-between items-center">
             <span className="text-gray-500 font-medium">Tổng kết học kỳ</span>
             <div className="flex items-center gap-2">
                 <span className="text-gray-600">Tổng điểm:</span>
                 <span className={`text-2xl font-black ${calculateTotal() >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {calculateTotal()}
                 </span>
             </div>
        </div>

      </div>
    </div>
  );
}
