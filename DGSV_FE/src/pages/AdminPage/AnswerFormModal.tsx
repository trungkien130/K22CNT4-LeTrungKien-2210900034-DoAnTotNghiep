import type { Answer, AnswerForm } from "../../types/index";

interface Props {
  open: boolean;
  editing?: Answer | null;
  form: AnswerForm;
  setForm: React.Dispatch<React.SetStateAction<AnswerForm>>;
  onSave: () => void;
  onClose: () => void;
}

export default function AnswerFormModal({
  open,
  editing,
  form,
  setForm,
  onSave,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
          {editing ? "Sửa đáp án" : "Thêm đáp án"}
        </h3>

        {/* CONTENT */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-600 font-medium mb-2">Nội dung đáp án</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y min-h-[80px]"
              rows={3}
              value={form.contentAnswer}
              onChange={(e) =>
                setForm({ ...form, contentAnswer: e.target.value })
              }
              placeholder="Nhập nội dung đáp án..."
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* QUESTION ID */}
            <div>
                <label className="block text-gray-600 font-medium mb-2">Question ID</label>
                <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={form.questionId}
                    onChange={(e) =>
                    setForm({ ...form, questionId: Number(e.target.value) })
                    }
                />
            </div>

            {/* SCORE */}
            <div>
                <label className="block text-gray-600 font-medium mb-2">Điểm</label>
                <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={form.answerScore}
                    onChange={(e) =>
                    setForm({ ...form, answerScore: Number(e.target.value) })
                    }
                />
            </div>
          </div>
        </div>

        {/* STATUS + CHECKED */}
        <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 font-medium">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.checked })}
            />
            Kích hoạt
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 font-medium">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={form.checked}
              onChange={(e) => setForm({ ...form, checked: e.target.checked })}
            />
            Được chọn
          </label>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-3 mt-8">
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
