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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-6 text-center">
          {editing ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
        </h3>

        <div className="space-y-4">
          {/* Nội dung câu hỏi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung câu hỏi
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y min-h-[100px]"
              value={form.contentQuestion}
              onChange={(e) =>
                setForm({ ...form, contentQuestion: e.target.value })
              }
              placeholder="Nhập nội dung câu hỏi..."
            />
          </div>

          {/* Loại câu hỏi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại câu hỏi
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.typeQuestionId}
              onChange={(e) =>
                setForm({ ...form, typeQuestionId: +e.target.value })
              }
            >
              <option value={0}>-- Chọn loại câu hỏi --</option>
              {typeOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nhóm câu hỏi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhóm câu hỏi
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.groupQuestionId}
              onChange={(e) =>
                setForm({ ...form, groupQuestionId: +e.target.value })
              }
            >
              <option value={0}>-- Chọn nhóm câu hỏi --</option>
              {groupOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Thứ tự */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.orderBy}
              onChange={(e) => setForm({ ...form, orderBy: +e.target.value })}
              placeholder="Nhập số thứ tự (ví dụ: 1, 2, 3...)"
            />
          </div>

          {/* Người cập nhật */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người cập nhật
            </label>
            <input
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.updateBy}
              onChange={(e) => setForm({ ...form, updateBy: e.target.value })}
              placeholder="Tên người cập nhật (ví dụ: admin)"
            />
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
