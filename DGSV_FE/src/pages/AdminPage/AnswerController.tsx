import { useEffect, useState } from "react";
import api from "../../API/api";
import type { Answer } from "../../types";
import AnswerFormModal from "./AnswerFormModal";
import type { AnswerForm } from "../../types";
const ITEMS_PER_PAGE = 10;

export default function AnswerController() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Answer | null>(null);

  const [form, setForm] = useState<AnswerForm>({
    contentAnswer: "",
    questionId: 0,
    answerScore: 0,
    updateBy: "admin",
    status: true,
    checked: false,
  });

  // ================= FETCH =================
  const fetchAnswers = async () => {
    setLoading(true);
    try {
      const res = await api.getAnswers();
      setAnswers(res.data ?? []);
    } catch (err) {
      console.error("Lỗi lấy đáp án:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, []);

  // ================= ADD / EDIT =================
  const openAdd = () => {
    setEditing(null);
    setForm({
      contentAnswer: "",
      questionId: 0,
      answerScore: 0,
      updateBy: "admin",
      status: true,
      checked: false,
    });
    setOpenModal(true);
  };

  const openEdit = (a: Answer) => {
    setEditing(a);
    setForm({
      contentAnswer: a.contentAnswer,
      questionId: a.questionId,
      answerScore: a.answerScore,
      updateBy: a.updateBy,
      status: a.status,
      checked: a.checked,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.contentAnswer.trim() || form.questionId === 0) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      if (editing) {
        await api.updateAnswer(editing.id, form);
      } else {
        await api.createAnswer(form);
      }
      setOpenModal(false);
      fetchAnswers();
    } catch {
      alert("Lỗi khi lưu đáp án");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    if (!confirm("Xóa đáp án này?")) return;
    try {
      await api.deleteAnswer(id);
      setAnswers((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Không thể xóa");
    }
  };

  // ================= FILTER + PAGINATION =================
  const filteredAnswers = answers.filter((a) =>
    a.contentAnswer.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAnswers.length / ITEMS_PER_PAGE);

  const paginatedAnswers = filteredAnswers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ================= UI =================
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý đáp án</h2>
        <button
          onClick={openAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Thêm đáp án
        </button>
      </div>

      <input
        className="border px-4 py-2 w-full mb-6 rounded"
        placeholder="🔍 Tìm nội dung đáp án..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {loading ? (
        <p className="text-center py-10 text-gray-500">Đang tải...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 w-16">ID</th>
                  <th className="border px-4 py-2">Nội dung</th>
                  <th className="border px-4 py-2 w-24 text-center">Điểm</th>
                  <th className="border px-4 py-2 w-32 text-center">
                    Question ID
                  </th>
                  <th className="border px-4 py-2 w-40 text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedAnswers.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-center">{a.id}</td>
                    <td className="border px-4 py-2">{a.contentAnswer}</td>
                    <td className="border px-4 py-2 text-center font-semibold">
                      {a.answerScore}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {a.questionId}
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedAnswers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-purple-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <AnswerFormModal
        open={openModal}
        editing={editing}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}
