import { useEffect, useState } from "react";
import api from "../../API/api";
import { Trash2, Edit, Plus } from "lucide-react";
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
    <div className="p-4 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Quản lý Câu hỏi</h2>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Thêm mới
        </button>
      </div>

      <input
        className="border px-3 py-1.5 w-full mb-4 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b">
                  <tr>
                    <th className="px-3 py-3 w-16 text-left font-bold whitespace-nowrap">ID</th>
                    <th className="px-3 py-3 text-left font-bold">Nội dung</th>
                    <th className="px-3 py-3 w-32 whitespace-nowrap text-left font-bold">Loại</th>
                    <th className="px-3 py-3 w-32 whitespace-nowrap text-left font-bold">Nhóm</th>
                    <th className="px-3 py-3 w-24 text-center whitespace-nowrap font-bold">Người tạo</th>
                    <th className="px-3 py-3 w-20 text-center whitespace-nowrap font-bold">Hành động</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-3 py-3 font-medium text-gray-900">{q.id}</td>

                      <td className="px-3 py-3">
                        <div className="text-gray-700 font-medium line-clamp-2 md:whitespace-normal" title={q.contentQuestion}>
                          {q.contentQuestion}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-gray-600 truncate max-w-[150px]" title={String(q.typeQuestionName || "")}>
                        {q.typeQuestionName || "—"}
                      </td>

                      <td className="px-3 py-3 text-gray-600 truncate max-w-[150px]" title={String(q.groupQuestionName || "")}>
                        {q.groupQuestionName || "—"}
                      </td>

                      <td className="px-3 py-3 text-gray-500 text-center truncate max-w-[100px]" title={q.createBy || q.updateBy || ""}>
                        {q.createBy || q.updateBy || "—"}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => openEdit(q)}
                                className="text-blue-600 hover:bg-white hover:shadow-sm p-1.5 rounded-md border border-transparent hover:border-gray-200 transition-all"
                                title="Chỉnh sửa"
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(q.id)}
                                className="text-red-600 hover:bg-white hover:shadow-sm p-1.5 rounded-md border border-transparent hover:border-gray-200 transition-all"
                                title="Xóa"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedQuestions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                             <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-gray-400" />
                             </div>
                             <span>Chưa có dữ liệu câu hỏi</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
