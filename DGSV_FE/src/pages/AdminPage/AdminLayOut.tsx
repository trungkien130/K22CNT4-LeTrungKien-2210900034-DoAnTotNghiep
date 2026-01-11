import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminComponent/AdminSiderbar";
import AdminNav from "../../components/AdminComponent/AdminNav";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* CONTENT */}
      <div className="flex-1 flex flex-col">
        <AdminNav />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
