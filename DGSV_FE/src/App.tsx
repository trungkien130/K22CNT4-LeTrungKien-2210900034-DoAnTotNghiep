import { useAuth } from "./hook/useAuth";
import PublicRoutes from "./Routes/PublicRoutes";

import UserRoutes from "./Routes/UserRoutes";
import { hasAdminAccess } from "./utils/permissionUtils";
import { Routes, Route, Navigate } from "react-router-dom"; // ✅ Fixed Import
import AdminLayout from "./pages/AdminPage/AdminLayOut";
import Dashboard from "./pages/AdminPage/AdminDashBoard";
import QuestionController from "./pages/AdminPage/QuestionsControll";
import AnswerController from "./pages/AdminPage/AnswerController";
import UserController from "./pages/AdminPage/UserController";
import AccountController from "./pages/AdminPage/AccountController";
import SemesterManager from "./pages/AdminPage/SemesterManager";
import DepartmentManager from "./pages/AdminPage/DepartmentManager";
import ClassManager from "./pages/AdminPage/ClassManager";
import EvaluationController from "./pages/AdminPage/EvaluationController";
import PermissionManager from "./pages/PermissionManager";

export default function App() {
  const { user, login, logout } = useAuth();

  if (!user) {
    return <PublicRoutes onLogin={login} />;
  }

  // ✅ HYBRID USER (Student/Lecturer + Permissions):
  return (
    <Routes>
      <Route 
        path="/admin" 
        element={
          hasAdminAccess(user) ? (
            <AdminLayout onLogout={logout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="questions" element={<QuestionController />} />
        <Route path="answers" element={<AnswerController />} />
        <Route path="evaluations" element={<EvaluationController />} />
        <Route path="users" element={<UserController />} />
        <Route path="accounts" element={<AccountController />} />
        <Route path="semesters" element={<SemesterManager />} />
        <Route path="departments" element={<DepartmentManager />} />
        <Route path="classes" element={<ClassManager />} />
        <Route path="permissions" element={<PermissionManager />} />
      </Route>

      {/* 2. Login Transition Handling */}
      {/* When user logs in, URL is still /login on first render. Redirect correct based on role. */}
      <Route path="/login" element={<Navigate to={hasAdminAccess(user) ? "/admin" : "/"} replace />} />

      {/* 3. User Section - Everything else falls through to UserRoutes */}
      <Route path="/*" element={<UserRoutes user={user} onLogout={logout} />} />
    </Routes>
  );
}
