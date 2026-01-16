import { useEffect, useState } from "react";
import api from "../API/api";
import type { Question, Answer } from "../types";
import { useAuth } from "../hook/useAuth"; 
import { useLocation } from "react-router-dom"; // Added useLocation
import { AlertCircle } from "lucide-react";

type QuestionGroup = Record<string, Question[]>;

export default function SelfEvaluation() {
  const { user } = useAuth();
  const location = useLocation(); // Hook
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  const [groups, setGroups] = useState<QuestionGroup>({});
  const [answersMap, setAnswersMap] = useState<Record<number, Answer[]>>({});
  
  // evaluations: { [questionId]: { answerId, penaltyCount, score } }
  const [evaluations, setEvaluations] = useState<Record<number, { answerId: number, penaltyCount?: number, score: number }>>({});
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    // Check for passed state from Dashboard
    if (location.state?.semesterId) {
        setSelectedSemester(location.state.semesterId);
    }
  }, [location.state]); // Added dependency

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch Semesters, Questions, Answers
      const [semRes, qRes, aRes] = await Promise.all([
        api.getSemesters(),
        api.getQuestions(),
        api.getAnswers(),
      ]);
      setSemesters(semRes.data || []);

      // Group Questions
      const grouped: QuestionGroup = {};
      const questions = (qRes.data || []) as Question[];
      questions.forEach((q) => {
        const typeName = String(q.typeQuestionName ?? "Khác");
        if (!grouped[typeName]) grouped[typeName] = [];
        grouped[typeName].push(q);
      });
      setGroups(grouped);

      // Map Answers
      const answers = (aRes.data || []) as Answer[];
      const ansMap: Record<number, Answer[]> = {};
      answers.forEach((a) => {
        if (!ansMap[a.questionId]) ansMap[a.questionId] = [];
        ansMap[a.questionId].push(a);
      });
      setAnswersMap(ansMap);

    } catch (err) {
      console.error("Load data error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (qId: number, answer: Answer) => {
    setEvaluations(prev => {
      const current = prev[qId];
      // TOGGLE LOGIC: If clicking the same answer, deselect it.
      if (current?.answerId === answer.id) {
        const { [qId]: _, ...rest } = prev;
        return rest;
      }
      
      const isPenalty = answer.answerScore < 0;
      return {
        ...prev,
        [qId]: {
          answerId: answer.id,
          score: answer.answerScore,
          penaltyCount: isPenalty ? 1 : undefined
        }
      };
    });
  };

  const handlePenaltyCountChange = (qId: number, count: number) => {
    setEvaluations(prev => {
        const current = prev[qId];
        if (!current) return prev;
        return {
            ...prev,
            [qId]: {
                ...current,
                penaltyCount: count
            }
        };
    });
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
    // Clamp total score between -100 and 100
    return Math.min(100, Math.max(-100, total));
  };

  const handleSubmit = async () => {
    if (!selectedSemester) {
      alert("Vui lòng chọn Học kỳ!");
      return;
    }
    const studentId = user?.userId;
    if (!studentId) {
        alert("Không tìm thấy thông tin người dùng!");
        return;
    }

    const payload = {
        semesterId: selectedSemester,
        studentId: studentId,
        totalScore: calculateTotal(),
        details: Object.values(evaluations).map(e => ({
            answerId: e.answerId,
            count: e.penaltyCount || 1
        }))
    };

    try {
        await api.createEvaluation(payload);
        alert("Gửi đánh giá thành công!");
        setEvaluations({});
        setSelectedSemester(null);
    } catch (error) {
        console.error(error);
        alert("Lỗi khi gửi đánh giá");
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Đang tải dữ liệu...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">Phiếu Tự Đánh Giá</h2>
      
      {/* SEMESTER SELECTION */}
      <div className="bg-white p-6 rounded-xl shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Học kỳ đánh giá</label>
        <select 
            className="w-full md:w-1/3 border p-2 rounded-lg"
            value={selectedSemester || ""}
            onChange={e => setSelectedSemester(Number(e.target.value))}
        >
            <option value="">-- Chọn Học kỳ --</option>
            {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.schoolYear})</option>
            ))}
        </select>
      </div>

      {Object.entries(groups).map(([typeName, questions]) => (
        <div key={typeName} className="bg-white rounded-xl shadow p-6 space-y-6">
          <h3 className="text-xl font-bold text-blue-600 border-b pb-2">{typeName}</h3>

          {questions.map((q, index) => {
            const qAnswers = answersMap[q.id] || [];
            const userEval = evaluations[q.id];

            return (
              <div key={q.id} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold text-gray-800">
                    {index + 1}. {q.contentQuestion}
                    </p>
                </div>

                <div className="space-y-3 mt-2 pl-4">
                     {/* Deduplicate answers */
                      Object.values(qAnswers.reduce((acc, ans) => {
                          if (!acc[ans.contentAnswer]) acc[ans.contentAnswer] = ans;
                          return acc;
                        }, {} as Record<string, Answer>)
                      ).map(ans => {
                        const isSelected = userEval?.answerId === ans.id;
                        // COLLAPSE LOGIC
                        if (userEval && !isSelected) return null;

                        return (
                        <div key={ans.id} className="flex items-center justify-between animate-fadeIn">
                            <label 
                                className="flex items-center gap-3 cursor-pointer select-none py-2 px-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors w-full"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleAnswerSelect(q.id, ans);
                                }}
                            >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400 bg-white'}`}>
                                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                </div>
                                <span className="text-gray-700 font-medium">{ans.contentAnswer}</span>
                                <span className={`text-sm font-bold ${ans.answerScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ({ans.answerScore > 0 ? '+' : ''}{ans.answerScore})
                                </span>
                            </label>

                             {isSelected && ans.answerScore < 0 && (
                                <div className="flex items-center gap-2 pl-4">
                                    <label className="text-sm text-gray-600 whitespace-nowrap">Số lần vi phạm:</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max="100"
                                        value={userEval.penaltyCount || 1}
                                        onChange={(e) => {
                                            let val = Number(e.target.value);
                                            if (val < 1) val = 1;
                                            if (val > 100) val = 100;
                                            handlePenaltyCountChange(q.id, val);
                                        }}
                                        className="w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                        onClick={(e) => e.stopPropagation()} 
                                    />
                                </div>
                            )}
                        </div>
                     )})}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div className="bg-white p-4 rounded-xl shadow border border-gray-200 mt-6">
          {/* Closed Semester Warning */}
          {selectedSemester && semesters.find(s => s.id === selectedSemester) && !semesters.find(s => s.id === selectedSemester).isActive && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
               <div className="text-red-500"><AlertCircle size={24} /></div>
               <div>
                  <h4 className="font-bold text-red-700">Học kỳ đã đóng</h4>
                  <p className="text-sm text-red-600">Học kỳ này đã kết thúc. Bạn chỉ có thể xem lại kết quả.</p>
               </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div>
                 {/* Only show calculated total if not submitted or if we successfully mapped scores */}
                <span className="text-gray-600 font-medium">Tổng điểm tự đánh giá:</span>
                <span className={`text-3xl font-bold ml-3 ${calculateTotal() >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {calculateTotal()}
                </span>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={() => {
                        if(window.confirm("Bạn có chắc muốn hủy đánh giá?")) {
                            setEvaluations({});
                            setSelectedSemester(null);
                        }
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
                >
                    Hủy
                </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!selectedSemester || (!!selectedSemester && !semesters.find(s => s.id === selectedSemester)?.isActive)}
                        className={`px-8 py-3 rounded-lg font-bold shadow-lg transition transform active:scale-95 ${
                            !selectedSemester || (!!selectedSemester && !semesters.find(s => s.id === selectedSemester)?.isActive)
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed shadow-none transform-none"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                    {selectedSemester && !semesters.find(s => s.id === selectedSemester)?.isActive 
                        ? "Đã đóng" 
                        : "Gửi Đánh Giá"
                    }
                    </button>
            </div>
          </div>
      </div>
    </div>
  );
}
