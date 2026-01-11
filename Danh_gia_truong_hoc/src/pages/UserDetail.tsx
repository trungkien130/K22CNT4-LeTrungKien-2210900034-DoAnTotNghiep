import { useEffect, useState } from "react";
import type { User } from "../types";
import api from "../API/api";

interface UserInfo {
  id: string | number;
  fullName: string;
  birthday?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string;
  department?: string;
  position?: string;
  className?: string;
  course?: string;
  isActive: boolean;
}

interface UserDetailProps {
  user: User;
}

export default function UserDetail({ user }: UserDetailProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        setError("");

        const userIdToUse = user.userId ?? user.mssv;

        if (!userIdToUse) {
          setError("Không xác định được ID người dùng");
          return;
        }

        const res = await api.getUserInfo(user.role, userIdToUse.toString());
        setUserInfo(res.data);
      } catch (err) {
        setError("Không thể tải thông tin cá nhân");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user]);

  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa cập nhật";

  if (loading)
    return <p className="text-center">Đang tải thông tin người dùng...</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (!userInfo) return null;

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Thông tin cá nhân</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow">
        <div>
          <b>Họ và tên:</b>
          <p>{userInfo.fullName}</p>
        </div>

        <div>
          <b>Mã sinh viên:</b>
          <p>{userInfo.id}</p>
        </div>

        <div>
          <b>Ngày sinh:</b>
          <p>{formatDate(userInfo.birthday)}</p>
        </div>

        <div>
          <b>Email:</b>
          <p>{userInfo.email ?? "Chưa cập nhật"}</p>
        </div>

        <div>
          <b>Số điện thoại:</b>
          <p>{userInfo.phone ?? "Chưa cập nhật"}</p>
        </div>

        {userInfo.gender && (
          <div>
            <b>Giới tính:</b>
            <p>{userInfo.gender}</p>
          </div>
        )}

        {userInfo.department && (
          <div>
            <b>Khoa:</b>
            <p>{userInfo.department}</p>
          </div>
        )}

        {userInfo.className && (
          <div>
            <b>Lớp:</b>
            <p>{userInfo.className}</p>
          </div>
        )}

        {userInfo.course && (
          <div>
            <b>Khóa học:</b>
            <p>{userInfo.course}</p>
          </div>
        )}

        {userInfo.position && (
          <div>
            <b>Chức vụ:</b>
            <p>{userInfo.position}</p>
          </div>
        )}

        <div className="md:col-span-2">
          <b>Trạng thái:</b>
          <span
            className={`ml-2 px-3 py-1 rounded-full text-sm ${
              userInfo.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {userInfo.isActive ? "Hoạt động" : "Bị khóa"}
          </span>
        </div>
      </div>
    </div>
  );
}
