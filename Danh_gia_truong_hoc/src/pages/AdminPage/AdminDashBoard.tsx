// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import api from "../../API/api";

interface Stats {
  totalStudents: number;
  totalLecturers: number;
  totalCourses: number;
  totalQuestions: number;
  totalExams: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        // Gọi API backend để lấy số liệu thống kê
        // // const res = await api.getAdminDashboardStats();
        // setStats(res.data);
      } catch (err) {
        setError("Không thể tải dữ liệu Dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-center">Đang tải dữ liệu Dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-center">{error}</p>;
  }

  if (!stats) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Dashboard Admin</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">Tổng số sinh viên</p>
          <p className="text-2xl font-bold">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">Tổng số giảng viên</p>
          <p className="text-2xl font-bold">{stats.totalLecturers}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">Tổng số môn học</p>
          <p className="text-2xl font-bold">{stats.totalCourses}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">Tổng số câu hỏi</p>
          <p className="text-2xl font-bold">{stats.totalQuestions}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center md:col-span-2">
          <p className="text-gray-500">Tổng số đề thi</p>
          <p className="text-2xl font-bold">{stats.totalExams}</p>
        </div>
      </div>
    </div>
  );
}
