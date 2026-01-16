import { useEffect, useState } from "react";
import api from "../../API/api";
import type { Question, Answer, Account } from "../../types";

export default function EvaluationController() {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Account[]>([]);
  
  // Selection State
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null); // MSSV

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
    if (selectedClass) {
      fetchStudents(selectedClass);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

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

  useEffect(() => {
    if (selectedSemester && selectedStudent) {
        fetchUserEvaluation(selectedStudent, selectedSemester);
    } else {
        setEvaluations({});
    }
  }, [selectedSemester, selectedStudent]);

  const fetchUserEvaluation = async (studentId: string, semesterId: number) => {
      try {
          // Requires flatAnswers to be ready. If not, wait? 
          // UseEffect runs after initial fetch, so likely safe.
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

  // Re-run fetch if flatAnswers updates (initial load async issue)
  useEffect(() => {
      if (Object.keys(flatAnswers).length > 0 && selectedSemester && selectedStudent) {
          fetchUserEvaluation(selectedStudent, selectedSemester);
      }
  }, [flatAnswers]);

  const fetchStudents = async (classId: number) => {
    try {
      const res = await api.getAccountsByRole("STUDENT");
      const allStudents = res.data || [];
      
      const cls = classes.find(c => c.id === classId);
      if (cls) {
        setStudents(allStudents.filter((s: Account) => s.className === cls.name || (s as any).classId === classId)); // Handle both cases just in case
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
      
      // Untick logic: if clicking same answer, remove it
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
        setEvaluations({});
        // Keep context
    } catch (error) {
        console.error(error);
        alert("Lỗi khi lưu đánh giá");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Đánh giá Sinh viên</h2>

      {loading && <p className="text-center text-gray-500 my-4">Đang tải dữ liệu...</p>}

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Học kỳ</label>
            <select 
                className="w-full border p-2 rounded"
                value={selectedSemester || ""}
                onChange={e => setSelectedSemester(Number(e.target.value))}
            >
                <option value="">-- Chọn Học kỳ --</option>
                {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.schoolYear})</option>
                ))}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
            <select 
                className="w-full border p-2 rounded"
                value={selectedClass || ""}
                onChange={e => setSelectedClass(Number(e.target.value))}
            >
                <option value="">-- Chọn Lớp --</option>
                {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sinh viên</label>
            <select 
                className="w-full border p-2 rounded"
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

      {selectedStudent && (
          <div className="bg-white p-6 rounded shadow space-y-8">
              {questions.map((q, index) => {
                  const qAnswers = answersMap[q.id] || [];
                  const userEval = evaluations[q.id];
                  
                  return (
                    <div key={q.id} className="border-b pb-4 last:border-0 hover:bg-gray-50 transition p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-lg text-gray-800">
                                {index + 1}. {q.contentQuestion}
                            </h4>
                            {/* Badge removed based on user feedback */}
                        </div>

                        <div className="space-y-2 ml-4">
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
                                        className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white w-full transition"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleAnswerSelect(q.id, ans);
                                        }}
                                    >
                                        <div 
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400 bg-white'}`}
                                        >
                                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                        </div>
                                        <span className="text-gray-700">{ans.contentAnswer}</span>
                                        <span className={`text-sm font-medium ${ans.answerScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ({ans.answerScore > 0 ? '+' : ''}{ans.answerScore})
                                        </span>
                                    </label>
                                    
                                    {/* Penalty Count Input */}
                                    {isSelected && ans.answerScore < 0 && (
                                        <div className="flex items-center gap-2 animate-fadeIn pl-4">
                                            <label className="text-sm text-gray-600 whitespace-nowrap">Số lần:</label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                max="100"
                                                value={userEval.penaltyCount || 1}
                                                onChange={(e) => handlePenaltyCountChange(q.id, Number(e.target.value))}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-16 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    </div>
                  );
              })}

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mt-8 border">
                  <div>
                      <span className="text-gray-600">Tổng điểm dự kiến:</span>
                      <span className={`text-2xl font-bold ml-2 ${calculateTotal() >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {calculateTotal()}
                      </span>
                  </div>
                  <button 
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
                  >
                      Hoàn tất Đánh giá
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}
