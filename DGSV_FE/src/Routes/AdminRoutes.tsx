import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../pages/AdminPage/AdminLayOut";
import Dashboard from "../pages/AdminPage/AdminDashBoard";
import QuestionController from "../pages/AdminPage/QuestionsControll";
import AnswerController from "../pages/AdminPage/AnswerController";
import UserController from "../pages/AdminPage/UserController";

export default function AdminRoutes({ onLogout }: { onLogout: () => void }) {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout onLogout={onLogout} />}>
        <Route index element={<Dashboard />} />
        <Route path="questions" element={<QuestionController />} />
        <Route path="answers" element={<AnswerController />} />
        <Route path="users" element={<UserController />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
