import { useEffect, useState } from "react";
import api from "../../API/api";
import type { Answer } from "../../types";
import { Trash2, Edit, Plus } from "lucide-react";
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
      setCurrentPage(1);
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

  // ================= SAVE =================
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
    <div className="p-4 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Quản lý Đáp án</h2>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Thêm đáp án
        </button>
      </div>

      <input
        className="border px-3 py-1.5 w-full mb-4 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
          <div className="bg-white rounded shadow overflow-x-auto border border-gray-200">
            <table className="min-w-full whitespace-nowrap">
              <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                <tr>
                  <th className="px-3 py-2 text-left w-12 font-semibold">ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Nội dung</th>
                  <th className="px-3 py-2 text-center w-20 font-semibold">Điểm</th>
                  <th className="px-3 py-2 text-center w-24 font-semibold">
                    Q.ID
                  </th>
                  <th className="px-3 py-2 text-right w-24 font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 text-sm/relaxed">
                {paginatedAnswers.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 font-medium text-gray-900">{a.id}</td>

                    <td className="px-3 py-2">
                      <div className="line-clamp-2 text-gray-700 min-w-[200px]" title={a.contentAnswer}>
                        {a.contentAnswer}
                      </div>
                    </td>

                    <td className="px-3 py-2 text-center font-semibold text-blue-600">
                      {a.answerScore}
                    </td>

                    <td className="px-3 py-2 text-center text-gray-500">
                      {a.questionId}
                    </td>

                    <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(a)}
                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"
                        title="Sửa"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedAnswers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 text-xs">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-4 text-xs">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                ←
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                →
              </button>
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
