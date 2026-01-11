import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import type { User } from "../types";

export default function PublicRoutes() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <Login
            onLogin={function (user: User): void {
              throw new Error("Function not implemented.");
            }}
          />
        }
      />
    </Routes>
  );
}
