import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../pages/AdminPage/AdminLayOut";
import Dashboard from "../pages/AdminPage/AdminDashBoard";
import QuestionController from "../pages/AdminPage/QuestionsControll";
import AnswerController from "../pages/AdminPage/AnswerController";
import UserController from "../pages/AdminPage/UserController";
import AccountController from "../pages/AdminPage/AcountController";
import SemesterManager from "../pages/AdminPage/SemesterManager";
import DepartmentManager from "../pages/AdminPage/DepartmentManager";
import ClassManager from "../pages/AdminPage/ClassManager";
import EvaluationController from "../pages/AdminPage/EvaluationController";
import PermissionManager from "../pages/PermissionManager";

export default function AdminRoutes({ onLogout }: { onLogout: () => void }) {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout onLogout={onLogout} />}>
        <Route index element={<Dashboard />} />
        <Route path="questions" element={<QuestionController />} />
        <Route path="answers" element={<AnswerController />} />
        <Route path="evaluations" element={<EvaluationController />} />
        <Route path="users" element={<UserController />} />
        <Route path="acounts" element={<AccountController />} />
        <Route path="semesters" element={<SemesterManager />} />
        <Route path="departments" element={<DepartmentManager />} />
        <Route path="classes" element={<ClassManager />} />
        <Route path="permissions" element={<PermissionManager />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
