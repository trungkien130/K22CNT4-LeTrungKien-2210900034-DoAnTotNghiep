import { useEffect, useState } from "react";
import api from "../../API/api";
import type { Question, Answer, Account } from "../../types";
import { Search, Filter, PenTool, CheckSquare } from "lucide-react";


export default function EvaluationController() {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Account[]>([]);
  
  // Selection State
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null); // MSSV

  // View State
  const [isViewEnabled, setIsViewEnabled] = useState(false);

  // Data State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<number, Answer[]>>({});
  
  // Map<questionId, { answerId, penaltyCount? }>
  const [evaluations, setEvaluations] = useState<Record<number, { answerId: number, penaltyCount?: number, score: number }>>({});
  
  // Flat Map for easy lookup: AnswerId -> Answer
  const [flatAnswers, setFlatAnswers] = useState<Record<number, Answer>>({});

  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setIsViewEnabled(false); // Reset view when class changes
    if (selectedClass) {
      fetchStudents(selectedClass);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  // Reset view if other filters change
  useEffect(() => {
      setIsViewEnabled(false);
  }, [selectedSemester, selectedStudent]);


  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [semRes, classRes, qRes, aRes] = await Promise.all([
        api.getSemesters(),
        api.getClassesList(),
        api.getQuestions(),
        api.getAnswers()
      ]);
      setSemesters(semRes.data || []);
      setClasses(classRes.data || []);
      setQuestions(qRes.data || []);
      
      // Group answers by question
      const answers = aRes.data || [];
      const grouped: Record<number, Answer[]> = {};
      const flat: Record<number, Answer> = {};
      
      answers.forEach((a: Answer) => {
        if (!grouped[a.questionId]) grouped[a.questionId] = [];
        grouped[a.questionId].push(a);
        flat[a.id] = a;
      });
      setAnswersMap(grouped);
      setFlatAnswers(flat);
      
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
      if (!selectedSemester || !selectedStudent) {
          alert("Vui lòng chọn Học kỳ và Sinh viên!");
          return;
      }
      setIsViewEnabled(true);
      fetchUserEvaluation(selectedStudent, selectedSemester);
  };

  const fetchUserEvaluation = async (studentId: string, semesterId: number) => {
      try {
          if (Object.keys(flatAnswers).length === 0) return;

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
          // If 404 or error, assume no evaluation
          setEvaluations({});
      }
  };

  const fetchStudents = async (classId: number) => {
    try {
      const res = await api.getAccountsByRole("STUDENT");
      const allStudents = res.data || [];
      
      const cls = classes.find(c => c.id === classId);
      if (cls) {
        setStudents(allStudents.filter((s: Account) => s.className === cls.name || (s as any).classId === classId)); 
      } else {
        setStudents(allStudents);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnswerSelect = (qId: number, answer: Answer) => {
    setEvaluations(prev => {
      const currentAnswerId = prev[qId]?.answerId;
      
      if (currentAnswerId === answer.id) {
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
        
        // Clamp 1-100
        let val = count;
        if (val < 1) val = 1;
        if (val > 100) val = 100;

        return {
            ...prev,
            [qId]: {
                ...current,
                penaltyCount: val
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
    // Clamp -100 to 100
    if (total > 100) return 100;
    if (total < -100) return -100;
    return total;
  };

  const handleSubmit = async () => {
    if (!selectedSemester || !selectedStudent) {
      alert("Vui lòng chọn Học kỳ và Sinh viên!");
      return;
    }

    const payload = {
        semesterId: selectedSemester,
        studentId: selectedStudent,
        totalScore: calculateTotal(),
        details: Object.values(evaluations).map(e => ({
            answerId: e.answerId,
            count: e.penaltyCount || 1
        }))
    };

    try {
        await api.createEvaluation(payload);
        alert("Đánh giá thành công!");
        setIsViewEnabled(false); // Close view or Reset? Maybe keep open but reload? User might want to verify.
        // Let's keep data but maybe refresh
        setEvaluations({});  // OR keep specific values?
    } catch (error) {
        console.error(error);
        alert("Lỗi khi lưu đánh giá");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-gray-50 text-sm">
      
      {/* === LEFT SIDEBAR: FILTER === */}
      <div className="w-full md:w-64 bg-white border-r shadow-sm flex flex-col z-10 flex-shrink-0">
         <div className="p-3 border-b bg-gray-50/50">
            <h2 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                <Filter size={16} />
                Bộ lọc tìm kiếm
            </h2>
         </div>
         
         <div className="p-3 space-y-3 flex-1 overflow-y-auto">
            {/* Semester */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Học kỳ</label>
                <div className="relative">
                    <select 
                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs"
                        value={selectedSemester || ""}
                        onChange={e => setSelectedSemester(Number(e.target.value))}
                    >
                        <option value="">-- Chọn Học kỳ --</option>
                        {semesters.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.schoolYear})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Class */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Lớp</label>
                <div className="relative">
                    <select 
                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs"
                        value={selectedClass || ""}
                        onChange={e => setSelectedClass(Number(e.target.value))}
                    >
                        <option value="">-- Chọn Lớp --</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Student */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Sinh viên</label>
                <div className="relative">
                    <select 
                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs disabled:bg-gray-100 disabled:text-gray-400"
                        value={selectedStudent || ""}
                        onChange={e => setSelectedStudent(e.target.value)}
                        disabled={!selectedClass}
                    >
                        <option value="">-- Chọn Sinh viên --</option>
                        {students.map(s => (
                            <option key={s.id} value={(s as any).studentId || s.id}>{s.fullName} ({s.userName})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={handleSearch}
                disabled={!selectedSemester || !selectedStudent || loading}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
                <Search size={14} />
                Xem đánh giá
            </button>
         </div>
         
         <div className="p-2 border-t text-[10px] text-center text-gray-400">
             Chọn đầy đủ thông tin để hiển thị.
         </div>
      </div>

      {/* === RIGHT CONTENT: RESULTS === */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
        {!isViewEnabled ? (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-white p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <CheckSquare className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">Chưa chọn nội dung</h3>
                    <p className="text-center max-w-sm text-xs">
                        Vui lòng chọn Học kỳ, Lớp và Sinh viên ở cột bên trái, sau đó nhấn nút "Xem đánh giá".
                    </p>
                </div>
            </div>
        ) : (
            <>
                <div className="flex-1 overflow-y-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-800">
                                Đánh giá rèn luyện
                            </h2>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        <span>MSSV: <strong className="text-gray-700">{selectedStudent}</strong></span>
                        <span className="text-gray-300">|</span>
                        <span>Học kỳ ID: <strong className="text-gray-700">{selectedSemester}</strong></span>
                    </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4 mb-4">
                    {loading && <p className="text-center text-gray-500 my-4 text-xs">Đang tải dữ liệu...</p>}
                    
                    {questions.map((q, index) => {
                        const qAnswers = answersMap[q.id] || [];
                        const userEval = evaluations[q.id];
                        
                        return (
                            <div key={q.id} className="border-b pb-4 last:border-0 hover:bg-gray-50/50 transition p-3 rounded-lg">
                                <h4 className="font-semibold text-sm text-gray-800 mb-3 flex gap-2.5">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 flex items-center justify-center rounded-full text-xs flex-shrink-0 mt-0.5">{index + 1}</span>
                                    {q.contentQuestion}
                                </h4>

                                <div className="space-y-2 ml-8">
                                    {/* Deduplicate answers based on content */
                                    Object.values(
                                        qAnswers.reduce((acc, ans) => {
                                        if (!acc[ans.contentAnswer]) acc[ans.contentAnswer] = ans;
                                        return acc;
                                        }, {} as Record<string, Answer>)
                                    ).map(ans => {
                                        const isSelected = userEval?.answerId === ans.id;
                                        // COLLAPSE LOGIC: If a selection exists for this question, ONLY render the selected answer.
                                        if (userEval && !isSelected) return null;

                                        return (
                                        <div key={ans.id} className="flex items-center justify-between group animate-fadeIn">
                                            <label 
                                                className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg w-full transition border ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-white border-transparent hover:border-gray-100'}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleAnswerSelect(q.id, ans);
                                                }}
                                            >
                                                <div 
                                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}
                                                >
                                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <span className="text-gray-700 text-xs font-medium">{ans.contentAnswer}</span>
                                                <span className={`text-xs font-bold ml-auto ${ans.answerScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ({ans.answerScore > 0 ? '+' : ''}{ans.answerScore})
                                                </span>
                                            </label>
                                            
                                            {/* Penalty Count Input */}
                                            {isSelected && ans.answerScore < 0 && (
                                                <div className="flex items-center gap-2 animate-fadeIn pl-3 ml-2 border-l border-gray-200">
                                                    <label className="text-xs text-gray-600 whitespace-nowrap font-medium">Số lần:</label>
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        max="100"
                                                        value={userEval.penaltyCount || 1}
                                                        onChange={(e) => handlePenaltyCountChange(q.id, Number(e.target.value))}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-12 border border-gray-300 rounded px-1 py-1 text-center font-bold text-xs focus:ring-1 focus:ring-red-500 outline-none"
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
                </div>

                {/* Fixed Summary Footer */}
                <div className="bg-white border-t p-3 shadow-lg flex justify-between items-center z-20 flex-shrink-0">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Tổng điểm</span>
                        <span className={`text-2xl font-black ${calculateTotal() >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {calculateTotal()}
                        </span>
                    </div>
                    <button 
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md shadow-blue-200 transition-all transform hover:-translate-y-0.5 text-xs"
                    >
                        Lưu kết quả
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
