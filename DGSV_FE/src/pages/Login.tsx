import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { loginApi } from "../API/authApi";
import type { User } from "../types";

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [UserName, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedUsername = UserName.trim();

    if (!trimmedUsername || !password) {
      setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      setLoading(false);
      return;
    }

    try {
      const res = await loginApi(trimmedUsername, password);

      if (res.status === 200) {
        const { role, userId, fullName } = res.data;

        // Tạo object user đầy đủ
        const userData: User = {
          name: fullName || trimmedUsername,
          mssv: role === "STUDENT" ? userId : null,
          userId: userId, // ← ĐÃ SỬA: đúng cú pháp
          role: role as "ADMIN" | "LECTURER" | "STUDENT",
        };

        // Lưu vào localStorage
        localStorage.setItem("user", JSON.stringify(userData));

        // Gọi callback để App cập nhật state và chuyển trang
        onLogin(userData);
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      let msg =
        "Không thể kết nối tới server. Vui lòng kiểm tra backend đang chạy trên port 7076.";

      if (err.response) {
        // Lỗi từ server (401, 500, v.v.)
        if (err.response.status === 401) {
          msg = "Sai tài khoản hoặc mật khẩu";
        } else if (err.response.data?.message) {
          msg = err.response.data.message;
        } else if (typeof err.response.data === "string") {
          msg = err.response.data;
        }
      } else if (err.message) {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            TỰ ĐÁNH GIÁ SINH VIÊN
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Khoa CNTT - ĐH Nguyễn Trãi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={UserName}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Tài khoản"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg font-medium"
          >
            <LogIn className="w-5 h-5" />
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
