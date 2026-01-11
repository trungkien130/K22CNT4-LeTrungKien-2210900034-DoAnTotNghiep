import { useAuth } from "./hook/useAuth";
import PublicRoutes from "./Routes/PublicRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import UserRoutes from "./Routes/UserRoutes";

export default function App() {
  const { user, logout } = useAuth();

  if (!user) {
    return <PublicRoutes />;
  }

  return user.role === "ADMIN" ? (
    <AdminRoutes />
  ) : (
    <UserRoutes user={user} onLogout={logout} />
  );
}
