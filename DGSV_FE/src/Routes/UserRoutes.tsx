import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import UserDetail from "../pages/UserDetail";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Siderbar";
import type { User } from "../types";

export default function UserRoutes({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar role={user.role} />

      <div className="flex-1 flex flex-col">
        <Navbar user={user} onLogout={onLogout} />

        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/user-detail" element={<UserDetail user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
