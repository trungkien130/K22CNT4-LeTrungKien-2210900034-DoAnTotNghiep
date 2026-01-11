import { useAuth } from "./hook/useAuth";
import PublicRoutes from "./Routes/PublicRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import UserRoutes from "./Routes/UserRoutes";

export default function App() {
  const { user, login, logout } = useAuth();

  if (!user) {
    return <PublicRoutes onLogin={login} />;
  }

  return user.role === "ADMIN" ? (
    <AdminRoutes onLogout={logout} />
  ) : (
    <UserRoutes user={user} onLogout={logout} />
  );
}
