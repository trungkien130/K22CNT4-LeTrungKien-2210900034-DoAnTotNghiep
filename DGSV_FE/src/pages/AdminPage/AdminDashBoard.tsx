// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import api from "../../API/api";
import { Users, BookOpen, School, HelpCircle, FileText, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Stats {
  totalStudents: number;
  totalLecturers: number;
  totalCourses: number; // Actually classes roughly
  totalQuestions: number;
  totalSemesters: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    totalQuestions: 0,
    totalSemesters: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch all necessary data in parallel
        const [usersRes, classesRes, questionsRes, semRes] = await Promise.all([
            api.getAllUsers(),
            api.getClassesList(),
            api.getQuestions(),
            api.getSemesters()
        ]);

        const users = usersRes.data || [];
        const classes = classesRes.data || [];
        const questions = questionsRes.data || [];
        const semesters = semRes.data || [];

        // Calculate stats
        const students = users.filter((u: any) => u.role === "STUDENT").length;
        const lecturers = users.filter((u: any) => u.role === "LECTURER").length;

        setStats({
            totalStudents: students,
            totalLecturers: lecturers,
            totalCourses: classes.length,
            totalQuestions: questions.length,
            totalSemesters: semesters.length
        });

      } catch (err) {
        console.error(err);
        // Fallback or just show 0
        setError("Không thể tải một số dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  const statCards = [
      { 
          label: "Tổng sinh viên", 
          value: stats.totalStudents, 
          icon: <Users className="w-8 h-8 text-blue-600" />,
          bg: "bg-blue-50",
          path: "/admin/users"
      },
      { 
          label: "Tổng giảng viên", 
          value: stats.totalLecturers, 
          icon: <Users className="w-8 h-8 text-indigo-600" />,
          bg: "bg-indigo-50",
          path: "/admin/users"
      },
      { 
          label: "Lớp học", 
          value: stats.totalCourses, 
          icon: <School className="w-8 h-8 text-green-600" />,
          bg: "bg-green-50",
          path: "/admin/classes"
      },
      { 
          label: "Ngân hàng câu hỏi", 
          value: stats.totalQuestions, 
          icon: <HelpCircle className="w-8 h-8 text-orange-600" />,
          bg: "bg-orange-50",
          path: "/admin/questions"
      },
      { 
        label: "Học kỳ", 
        value: stats.totalSemesters, 
        icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
        bg: "bg-purple-50",
        path: "/admin/semesters"
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Tổng quan hệ thống</h2>
        <p className="text-gray-500 mt-1">Chào mừng quay trở lại, Admin!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((item, idx) => (
            <div 
                key={idx} 
                onClick={() => navigate(item.path)}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-200 hover:-translate-y-1"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${item.bg}`}>
                        {item.icon}
                    </div>
                </div>
                <div>
                    <h3 className="text-gray-500 text-sm font-medium">{item.label}</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{item.value}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
