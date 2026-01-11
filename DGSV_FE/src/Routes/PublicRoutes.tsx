import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import type { User } from "../types";

export default function PublicRoutes({
  onLogin,
}: {
  onLogin: (user: User) => void;
}) {
  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
