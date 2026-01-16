import { useEffect, useState } from "react";
import api from "../../API/api";
import type { UserAdmin, Role } from "../../types";
import { Trash2, Edit, Filter, Plus, Upload } from "lucide-react";
import UserFormModal from "./UserFormModal";
import type { UserForm } from "../../types";
import CustomDropdown from "../../components/AdminComponent/CustomDropdown";

const ITEMS_PER_PAGE = 10;

export default function UserController() {
  const [role, setRole] = useState<Role>("STUDENT"); // ✅ State role filter
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
      classId: u.classId, // ✅ Pass classId to form
      birthday: u.birthday,
      gender: u.gender,
    });
    setOpenModal(true);
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      if (!editing) {
        // ===== CLIENT VALIDATION =====
        if (role !== "ADMIN" && !form.entityId?.trim()) {
           alert(`Vui lòng nhập ${role === "STUDENT" ? "Mã sinh viên" : "Mã giảng viên"}!`);
           return;
        }
        if (!form.userName?.trim()) {
           alert("Vui lòng nhập Username!");
           return;
        }
        if (!form.password?.trim()) {
           alert("Vui lòng nhập Mật khẩu!");
           return;
        }

        // ===== CREATE NEW =====
        const payload = {
          role: role,
          userName: form.userName || "",
          password: form.password || "",
          fullName: form.fullName,
          id: form.entityId || "", // ✅ Send Entity ID
          email: form.email,
          phone: form.phone,
          birthday: form.birthday ? new Date(form.birthday).toISOString() : undefined,
          gender: form.gender,
          classId: form.classId,
        };
        console.log("Register Payload:", payload);
        await api.register(payload);
        alert("Thêm mới thành công!");
      } else {
        // ===== UPDATE =====
        await api.updateUser(editing.role, editing.id, form);
        alert("Cập nhật thành công!");
      }
      setOpenModal(false);
      fetchUsers();
    } catch (err: any) {
      console.error("Register Error:", err);
      if (err.response && err.response.data && err.response.data.errors) {
        const errorDetails = JSON.stringify(err.response.data.errors, null, 2);
        alert(`Lỗi chi tiết:\n${errorDetails}`);
      } else {
        const msg = err.response?.data ? JSON.stringify(err.response.data) : "Có lỗi xảy ra!";
        alert(`Thêm mới thất bại: ${msg}`);
      }
    }
  };

  // ================= DELETE =================
  const handleDelete = async (u: UserAdmin) => {
    if (!confirm("Xóa người dùng này?")) return;
    await api.deleteUser(u.role, u.id);
    fetchUsers();
  };

  // ================= SEARCH + FILTER =================
  const filteredUsers = users
    .filter((u) => u.role === role) // ✅ Filter by Role
    .filter((u) =>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Quản lý Người dùng</h2>
        
        {/* Actions Group: Filter + Buttons */}
        <div className="flex items-center gap-4">
          <CustomDropdown
            icon={<Filter size={18} />}
            value={role}
            onChange={(val) => {
              setRole(val as Role);
              setCurrentPage(1);
            }}
            options={[
              { label: "Sinh viên", value: "STUDENT" },
              { label: "Giảng viên", value: "LECTURER" },
              { label: "Admin", value: "ADMIN" },
            ]}
          />

          {/* Buttons Group */}
          <div className="flex items-center gap-2">
            {/* ✅ Add New Button */}
            <button
              onClick={() => {
                setEditing(null);
                setForm({
                  fullName: "",
                  email: "",
                  phone: "",
                  isActive: true,
                  entityId: "",
                  userName: "",
                  password: "",
                  birthday: "",
                  gender: true,
                  classId: undefined,
                });
                setOpenModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={18} /> Thêm mới
            </button>

            {/* ✅ Import Excel Button */}
             <div className="relative">
               <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  id="import-excel-user"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      await api.importExcel(file);
                      alert("Import thành công!");
                      fetchUsers();
                    } catch {
                      alert("Import thất bại!");
                    }
                    e.target.value = "";
                  }}
                />
                <label 
                  htmlFor="import-excel-user"
                  className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 cursor-pointer"
                >
                  <Upload size={18} /> Import Excel
                </label>
             </div>
          </div>
        </div>
      </div>

      <input
        className="border px-4 py-2 w-full mb-6 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left w-16">ID</th>
                  <th className="px-6 py-3 text-left w-[260px]">Họ tên</th>
                  
                  {/* ✅ Chỉ hiện cột Lớp nếu là STUDENT */}
                  {role === "STUDENT" && (
                    <th className="px-6 py-3 text-left w-20">Lớp</th>
                  )}
                  {role === "LECTURER" && (
                    <th className="px-6 py-3 text-left w-32">Khoa</th>
                  )}
                  
                  <th className="px-6 py-3 text-left w-28">Chức vụ</th>
                  <th className="px-6 py-3 text-left w-[200px]">Email</th>
                  <th className="px-6 py-3 text-left w-32">SĐT</th>
                  <th className="px-6 py-3 text-left w-32">Ngày sinh</th>
                  
                  {role === "STUDENT" && <th className="px-6 py-3 text-center w-20">Giới tính</th>}

                  <th className="px-6 py-3 text-center w-36">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right w-40">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((u) => (
                  <tr key={`${u.role}-${u.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.id}</td>

                    <td className="px-6 py-4">
                      <div className="text-gray-700 font-medium">
                        {u.fullName}
                      </div>
                    </td>

                    {/* ✅ Chỉ hiện cell Lớp nếu là STUDENT */}
                    {role === "STUDENT" && (
                      <td className="px-6 py-4 text-gray-600 truncate">
                        {u.className || "—"}
                      </td>
                    )}
                    {role === "LECTURER" && (
                      <td className="px-6 py-4 text-gray-600 truncate">
                        {u.departmentName || "—"}
                      </td>
                    )}

                    <td className="px-6 py-4 text-gray-500 text-sm">{u.position || u.role}</td>

                    <td className="px-6 py-4 text-gray-600 truncate">
                      {u.email || "—"}
                    </td>

                    <td className="px-6 py-4 text-gray-600 truncate">
                      {u.phone || "—"}
                    </td>

                    <td className="px-6 py-4 text-gray-600 truncate">
                       {u.birthday ? new Date(u.birthday).toLocaleDateString("vi-VN") : "—"}
                    </td>

                    {role === "STUDENT" && (
                      <td className="px-6 py-4 text-center text-gray-600">
                        {u.gender === true ? "Nam" : u.gender === false ? "Nữ" : "—"}
                      </td>
                    )}

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.isActive ? "Hoạt động" : "Ngưng"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                        title="Sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedUsers.length === 0 && (
                  <tr>
                    <td 
                      colSpan={role === "STUDENT" ? 10 : role === "LECTURER" ? 9 : 8} 
                      className="text-center py-8 text-gray-500"
                    >
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
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                ← Trước
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
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
        role={role} // ✅ Pass role
      />
    </div>
  );
}
