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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">
          {editing ? "Sửa đáp án" : "Thêm đáp án"}
        </h3>

        {/* CONTENT */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Nội dung đáp án</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={form.contentAnswer}
            onChange={(e) =>
              setForm({ ...form, contentAnswer: e.target.value })
            }
          />
        </div>

        {/* QUESTION ID */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Question ID</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={form.questionId}
            onChange={(e) =>
              setForm({ ...form, questionId: Number(e.target.value) })
            }
          />
        </div>

        {/* SCORE */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Điểm</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={form.answerScore}
            onChange={(e) =>
              setForm({ ...form, answerScore: Number(e.target.value) })
            }
          />
        </div>

        {/* STATUS + CHECKED */}
        <div className="flex gap-6 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.checked })}
            />
            Kích hoạt
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.checked}
              onChange={(e) => setForm({ ...form, checked: e.target.checked })}
            />
            Được chọn
          </label>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
