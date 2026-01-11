import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../pages/AdminPage/AdminLayOut";
import QuestionController from "../pages/AdminPage/QuestionsControll";
import Dashboard from "../pages/AdminPage/AdminDashBoard";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="questions" element={<QuestionController />} />
        {/* <Route path="users" element={<Users />} /> */}
      </Route>

      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  );
}
