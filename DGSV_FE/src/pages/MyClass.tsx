import { useEffect, useState } from "react";
import api from "../API/api";
import type { UserInfo } from "../types";
import StudentList from "../components/StudentList";

export default function MyClass() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to get current user ID/Role from localStorage or generic context if available
  // For now, we'll assume we need to fetch info based on the stored user in localStorage
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const userId = user.userId ?? user.mssv;
          const res = await api.getUserInfo(user.role, String(userId));
          setUserInfo(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch user info", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyInfo();
  }, []);

  if (loading) return <div className="p-8 text-center">Đang tải thông tin lớp...</div>;

  if (!userInfo?.className) {
    return (
      <div className="p-8 text-center text-gray-500">
        Bạn chưa được gán vào lớp nào hoặc không tìm thấy thông tin lớp.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-blue-600 pl-4">
        Lớp của tôi ({userInfo.className})
      </h2>
      <StudentList className={userInfo.className} />
    </div>
  );
}
