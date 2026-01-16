import type { Question } from "../../types";

export interface QuestionForm {
  contentQuestion: string;
  typeQuestionId: number;
  groupQuestionId: number;
  orderBy: number;
  updateBy: string;
}

interface Props {
  open: boolean;
  editing?: Question | null;
  form: QuestionForm;
  setForm: React.Dispatch<React.SetStateAction<QuestionForm>>;
  onSave: () => void;
  onClose: () => void;
  typeOptions: { id: number; name: string }[];
  groupOptions: { id: number; name: string }[];
}

export default function QuestionFormModal({
  open,
  editing,
  form,
  setForm,
  onSave,
  onClose,
  typeOptions,
  groupOptions,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
          {editing ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
        </h3>

        <div className="space-y-5">
          {/* Nội dung câu hỏi */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Nội dung câu hỏi
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y min-h-[100px]"
              value={form.contentQuestion}
              onChange={(e) =>
                setForm({ ...form, contentQuestion: e.target.value })
              }
              placeholder="Nhập nội dung câu hỏi..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             {/* Loại câu hỏi */}
            <div>
                <label className="block text-gray-600 font-medium mb-2">
                Loại câu hỏi
                </label>
                <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                value={form.typeQuestionId}
                onChange={(e) =>
                    setForm({ ...form, typeQuestionId: +e.target.value })
                }
                >
                <option value={0}>-- Chọn loại --</option>
                {typeOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                    {t.name}
                    </option>
                ))}
                </select>
            </div>

            {/* Nhóm câu hỏi */}
            <div>
                <label className="block text-gray-600 font-medium mb-2">
                Nhóm câu hỏi
                </label>
                <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
                value={form.groupQuestionId}
                onChange={(e) =>
                    setForm({ ...form, groupQuestionId: +e.target.value })
                }
                >
                <option value={0}>-- Chọn nhóm --</option>
                {groupOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                    {g.name}
                    </option>
                ))}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             {/* Thứ tự */}
            <div>
                <label className="block text-gray-600 font-medium mb-2">
                Thứ tự hiển thị
                </label>
                <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                value={form.orderBy}
                onChange={(e) => setForm({ ...form, orderBy: +e.target.value })}
                placeholder="1, 2, 3..."
                />
            </div>

            {/* Người cập nhật */}
            <div>
                <label className="block text-gray-600 font-medium mb-2">
                Người cập nhật
                </label>
                <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                value={form.updateBy}
                onChange={(e) => setForm({ ...form, updateBy: e.target.value })}
                placeholder="Admin..."
                />
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 mt-8 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-8 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
