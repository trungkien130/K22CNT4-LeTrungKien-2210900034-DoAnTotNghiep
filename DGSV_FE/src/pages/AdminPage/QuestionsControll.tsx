import { useEffect, useState } from "react";
import api from "../../API/api";
import type { Question } from "../../types";
import QuestionFormModal, { type QuestionForm } from "./QuestionsFormModal";

interface Option {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 10;

export default function QuestionController() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState<QuestionForm>({
    contentQuestion: "",
    typeQuestionId: 0,
    groupQuestionId: 0,
    orderBy: 0,
    updateBy: "",
  });

  const [typeOptions, setTypeOptions] = useState<Option[]>([]);
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);

  // ================= LẤY DỮ LIỆU =================
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.getQuestions();
      const data = res.data ?? [];
      setQuestions(data);
      updateOptionsFromQuestions(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách câu hỏi:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOptionsFromQuestions = (currentQuestions: Question[]) => {
    const typesMap = new Map<number, Option>();
    const groupsMap = new Map<number, Option>();

    currentQuestions.forEach((q) => {
      if (q.typeQuestionId && q.typeQuestionName) {
        typesMap.set(q.typeQuestionId, {
          id: q.typeQuestionId,
          name: String(q.typeQuestionName),
        });
      }

      if (q.groupQuestionId && q.groupQuestionName) {
        groupsMap.set(q.groupQuestionId, {
          id: q.groupQuestionId,
          name: String(q.groupQuestionName),
        });
      }
    });

    setTypeOptions([...typesMap.values()]);
    setGroupOptions([...groupsMap.values()]);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ================= THÊM / SỬA =================
  const openAdd = () => {
    setEditing(null);
    setForm({
      contentQuestion: "",
      typeQuestionId: 0,
      groupQuestionId: 0,
      orderBy: 0,
      updateBy: "",
    });
    setOpenModal(true);
  };

  const openEdit = (q: Question) => {
    setEditing(q);
    setForm({
      contentQuestion: q.contentQuestion,
      typeQuestionId: q.typeQuestionId ?? 0,
      groupQuestionId: q.groupQuestionId ?? 0,
      orderBy: q.orderBy ?? 0,
      updateBy: q.updateBy ?? "",
    });
    setOpenModal(true);
  };

  // ================= LƯU =================
  const handleSave = async () => {
    if (
      !form.contentQuestion.trim() ||
      form.typeQuestionId === 0 ||
      form.groupQuestionId === 0
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      if (editing) {
        await api.updateQuestion(editing.id, form);
      } else {
        await api.createQuestion(form);
      }

      setOpenModal(false);
      await fetchQuestions();
    } catch (err) {
      console.error("Lỗi khi lưu câu hỏi:", err);
      alert("Có lỗi xảy ra!");
    }
  };

  // ================= XÓA =================
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;

    try {
      await api.deleteQuestion(id);
      const newList = questions.filter((q) => q.id !== id);
      setQuestions(newList);
      updateOptionsFromQuestions(newList);
    } catch {
      alert("Không thể xóa câu hỏi");
    }
  };

  // ================= SEARCH + PAGINATION =================
  const filteredQuestions = questions.filter((q) =>
    q.contentQuestion.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ================= UI =================
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý câu hỏi</h2>
        <button
          onClick={openAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Thêm câu hỏi
        </button>
      </div>

      <input
        className="border px-4 py-2 w-full mb-6 rounded"
        placeholder="🔍 Tìm kiếm câu hỏi..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {loading ? (
        <p className="text-center py-10 text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow">
            <table className="min-w-full bg-white border table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 w-16 text-center">ID</th>
                  <th className="border px-4 py-2 w-[420px]">Nội dung</th>
                  <th className="border px-4 py-2 w-40">Loại</th>
                  <th className="border px-4 py-2 w-40">Nhóm</th>
                  <th className="border px-4 py-2 w-40 text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-center">{q.id}</td>

                    {/* FIX CỨNG CHIỀU CAO -> KHÔNG NHẢY */}
                    <td className="border px-4 py-2 align-top">
                      <div className="h-18 overflow-hidden break-words">
                        {q.contentQuestion}
                      </div>
                    </td>

                    <td className="border px-4 py-2 truncate">
                      {q.typeQuestionName || "—"}
                    </td>

                    <td className="border px-4 py-2 truncate">
                      {q.groupQuestionName || "—"}
                    </td>

                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => openEdit(q)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedQuestions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION – KHÔNG NHẢY */}
          {totalPages > 1 && (
            <div className="min-h-[56px] flex justify-center items-center gap-2 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ← Trước
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1 ? "bg-purple-600 text-white" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      <QuestionFormModal
        open={openModal}
        editing={editing}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onClose={() => setOpenModal(false)}
        typeOptions={typeOptions}
        groupOptions={groupOptions}
      />
    </div>
  );
}
