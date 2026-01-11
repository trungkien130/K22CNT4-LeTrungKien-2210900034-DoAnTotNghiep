import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminComponent/AdminSiderbar";
import AdminNav from "../../components/AdminComponent/AdminNav";

export default function AdminLayout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminNav onLogout={onLogout} />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
