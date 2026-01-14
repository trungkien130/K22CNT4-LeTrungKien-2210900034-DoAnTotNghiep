import { useEffect, useState } from "react";
import api from "../API/api";
import type { Question, Answer } from "../types";

type QuestionGroup = Record<string, Question[]>;

export default function SelfEvaluation() {
  const [groups, setGroups] = useState<QuestionGroup>({});
  const [answersMap, setAnswersMap] = useState<Record<number, Answer[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const qRes = await api.getQuestions();
      const grouped: QuestionGroup = {};

      for (const q of qRes.data as Question[]) {
        const typeName = String(q.typeQuestionName ?? "Khác");

        if (!grouped[typeName]) {
          grouped[typeName] = [];
        }

        grouped[typeName].push(q);
        loadAnswers(q.id);
      }

      setGroups(grouped);
    } catch (err) {
      console.error("Load dữ liệu lỗi", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnswers = async (questionId: number) => {
    try {
      const res = await api.getAnswersByQuestion(questionId);
      setAnswersMap((prev) => ({
        ...prev,
        [questionId]: res.data,
      }));
    } catch (err) {
      console.error("Load answer lỗi", err);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Đang tải dữ liệu...</p>;
  }
  console.log(groups);
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <h2 className="text-3xl font-bold text-center">Phiếu Tự Đánh Giá</h2>

      {Object.entries(groups).map(([typeName, questions]) => (
        <div
          key={typeName}
          className="bg-white rounded-xl shadow p-6 space-y-4"
        >
          {/* ===== TÊN LOẠI ===== */}
          <h3 className="text-xl font-bold text-blue-600">{typeName}</h3>

          {/* ===== CÂU HỎI + ĐÁP ÁN ===== */}
          {questions.map((q) => {
            const firstAnswer = answersMap[q.id]?.[0];

            return (
              <div
                key={q.id}
                className="border rounded-lg p-4 flex justify-between"
              >
                <p className="font-semibold">
                  {q.orderBy}. {q.contentQuestion}
                </p>

                {firstAnswer && (
                  <span className="min-w-[80px] text-center font-semibold text-blue-600">
                    {firstAnswer.answerScore} điểm
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
