export default function Dashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Tổng quan hệ thống</h2>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Sinh viên</p>
          <p className="text-3xl font-bold">1,250</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Câu hỏi</p>
          <p className="text-3xl font-bold">320</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Bài đánh giá</p>
          <p className="text-3xl font-bold">540</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Giảng viên</p>
          <p className="text-3xl font-bold">45</p>
        </div>
      </div>
    </div>
  );
}
