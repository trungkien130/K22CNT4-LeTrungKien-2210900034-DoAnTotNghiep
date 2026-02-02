import { useState, useEffect } from "react";
import { useAuth } from "../hook/useAuth";
import api from "../API/api";
import { Send, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface FeedbackItem {
  id: number;
  title: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function Feedback() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"submit" | "history">("submit");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (activeTab === "history" && user?.userId) {
      fetchFeedbacks();
    }
  }, [activeTab, user]);

  const fetchFeedbacks = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const res = await api.getMyFeedback(user.userId);
      setFeedbacks(res.data || []);
    } catch (error) {
      console.error("Error fetching feedbacks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId) return;

    setSubmitting(true);
    setMessage(null);

    try {
      await api.createFeedback({
        StudentId: user.userId,
        Title: title,
        Content: content,
      });
      setMessage({ type: "success", text: "Gửi ý kiến thành công!" });
      setTitle("");
      setContent("");
      if (activeTab === "history") fetchFeedbacks();
    } catch (error) {
        console.error("Error submitting feedback", error);
        setMessage({ type: "error", text: "Có lỗi xảy ra, vui lòng thử lại." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Đóng Góp Ý Kiến & Phản Hồi
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("submit")}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${
                activeTab === "submit"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Gửi Ý Kiến Mới
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${
                activeTab === "history"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Lịch Sử Phản Hồi
            </button>
          </div>

          <div className="p-6">
            {activeTab === "submit" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                  <div
                    className={`p-4 rounded-lg flex items-center gap-3 ${
                      message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p>{message.text}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Nhập tiêu đề ý kiến..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="Mô tả chi tiết ý kiến hoặc thắc mắc của bạn..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
                  >
                    {submitting ? (
                      <>
                        <Clock className="animate-spin w-5 h-5" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Gửi Ý Kiến
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              // History Tab
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Đang tải dữ liệu...</p>
                ) : feedbacks.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">Bạn chưa gửi ý kiến nào.</p>
                  </div>
                ) : (
                  feedbacks.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === "Reviewed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.status === "Reviewed" ? "Đã duyệt" : "Đang chờ"}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 whitespace-pre-wrap">{item.content}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
