import { useEffect, useState } from "react";
import api from "../../API/api";
import type { UserAdmin } from "../../types";
import UserFormModal from "./UserFormModal";
import type { UserForm } from "../../types";

const ITEMS_PER_PAGE = 10;

export default function UserController() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<UserAdmin | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState<UserForm>({
    fullName: "",
    email: "",
    phone: "",
    isActive: true,
  });

  // ================= FETCH =================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAllUsers();
      setUsers(res.data ?? []);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= EDIT =================
  const openEdit = (u: UserAdmin) => {
    setEditing(u);
    setForm({
      fullName: u.fullName,
      email: u.email || "",
      phone: u.phone || "",
      isActive: u.isActive,
    });
    setOpenModal(true);
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!editing) return;
    await api.updateUser(editing.role, editing.id, form);
    setOpenModal(false);
    fetchUsers();
  };

  // ================= DELETE =================
  const handleDelete = async (u: UserAdmin) => {
    if (!confirm("Xóa người dùng này?")) return;
    await api.deleteUser(u.role, u.id);
    fetchUsers();
  };

  // ================= SEARCH + PAGINATION =================
  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ================= UI =================
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý người dùng</h2>
      </div>

      <input
        className="border px-4 py-2 w-full mb-6 rounded"
        placeholder="🔍 Tìm kiếm người dùng..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {loading ? (
        <p className="text-center py-10 text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 w-16 text-center">ID</th>
                  <th className="border px-4 py-2">Họ tên</th>
                  <th className="border px-4 py-2">Role</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2 text-center">Trạng thái</th>
                  <th className="border px-4 py-2 w-40 text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={`${u.role}-${u.id}`} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-center">{u.id}</td>
                    <td className="border px-4 py-2">{u.fullName}</td>
                    <td className="border px-4 py-2">{u.role}</td>
                    <td className="border px-4 py-2">{u.email || "—"}</td>
                    <td className="border px-4 py-2 text-center">
                      {u.isActive ? "Hoạt động" : "Ngưng hoạt động"}
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ← Trước
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1 ? "bg-purple-600 text-white" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      <UserFormModal
        open={openModal}
        editing={editing}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}
