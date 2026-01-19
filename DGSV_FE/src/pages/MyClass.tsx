import { useEffect, useState } from "react";
import api from "../API/api";
import type { UserInfo } from "../types";
import StudentList from "../components/StudentList";
import { hasPermission } from "../utils/permissionUtils";

export default function MyClass() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          
          // ✅ Security Check: Only allow Monitors or Lecturers
          if (!hasPermission(user, "CLASS_MONITOR") && !hasPermission(user, "MONITOR")) {
             setHasAccess(false);
             setLoading(false);
             return;
          }
          setHasAccess(true);

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

  if (!hasAccess) {
      return (
          <div className="flex flex-col items-center justify-center p-10 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4 0h-2v-2m0 0l-2-2m2 2l2 2M12 4a4 4 0 014 4v2H8V8a4 4 0 014-4z" />
                  </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
              <p className="text-gray-600">Bạn phải là Lớp trưởng để xem danh sách lớp.</p>
          </div>
      );
  }

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
