import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import UserDetail from "../pages/UserDetail";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Siderbar";
import type { User } from "../types";

interface UserRoutesProps {
  user: User | null;
  onLogout: () => void;
}

const UserRoutes: React.FC<UserRoutesProps> = ({ user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex h-screen">
      <Sidebar role={user.role} />

      <div className="flex-1 flex flex-col">
        <Navbar user={user} onLogout={() => {}} />

        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/user-detail" element={<UserDetail user={user} />} />

            {user.role === "LECTURER" && (
              <Route path="/add-evaluation" element={<div />} />
            )}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UserRoutes;
