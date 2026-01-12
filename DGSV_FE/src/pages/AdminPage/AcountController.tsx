import { useEffect, useState } from "react";
import api from "../../API/api";
import type { Role, EditForm, Account } from "../../types";
import AccountFormModal from "./AcountFormModal";

const ITEMS_PER_PAGE = 10;

export default function AccountController() {
  /* ================= STATE ================= */

  const [role, setRole] = useState<Role>("STUDENT");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState<EditForm>({
    userName: "",
    fullName: "",
    isActive: true,
    roleId: 0, // ❗ KHÔNG dùng khi update
    studentId: null,
    lecturerId: null,
  });

  /* ================= GET ALL ================= */

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.getAccountsByRole(role);
      setAccounts(res.data ?? []);
      setCurrentPage(1);
    } catch {
      alert("Lỗi load danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [role]);

  /* ================= OPEN EDIT ================= */

  const openEdit = (acc: Account) => {
    setEditing(acc);
    setEditingId(acc.id);
    setForm({
      userName: acc.userName,
      fullName: acc.fullName ?? "",
      isActive: acc.isActive,
      roleId: 0,
      studentId: null,
      lecturerId: null,
    });
    setOpenModal(true);
  };

  /* ================= SAVE ================= */

  const handleSave = async (newPassword?: string) => {
    if (editingId === null) return;

    try {
      // 🔥 CHỈ UPDATE INFO KHI CÓ THAY ĐỔI INFO
      const hasInfoChange =
        form.userName !== editing?.userName ||
        form.isActive !== editing?.isActive ||
        (role === "ADMIN" && form.fullName !== editing?.fullName);

      if (hasInfoChange) {
        const payload: any = {
          userName: form.userName,
          isActive: form.isActive,
        };

        if (role === "ADMIN") {
          payload.fullName = form.fullName;
        }

        await api.updateAccount(role, editingId, payload);
      }

      // 🔐 ĐỔI MẬT KHẨU (API RIÊNG)
      if (newPassword && newPassword.trim() !== "") {
        await api.changePassword(role, editingId, newPassword);
      }

      setOpenModal(false);
      setEditing(null);
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa tài khoản này?")) return;

    try {
      await api.deleteAccount(role, id);
      fetchAccounts();
    } catch {
      alert("Xóa thất bại");
    }
  };

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(accounts.length / ITEMS_PER_PAGE);
  const paginatedAccounts = accounts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= UI ================= */

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Quản lý tài khoản</h2>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="border px-4 py-2 rounded"
        >
          <option value="STUDENT">Sinh viên</option>
          <option value="LECTURER">Giảng viên</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-center py-10 text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow">
            <table className="min-w-full bg-white border table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 w-16 text-center">ID</th>
                  <th className="border px-4 py-2 w-48">UserName</th>
                  <th className="border px-4 py-2">Họ tên</th>
                  <th className="border px-4 py-2 w-28 text-center">
                    Trạng thái
                  </th>
                  <th className="border px-4 py-2 w-40 text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-center">{acc.id}</td>
                    <td className="border px-4 py-2 truncate">
                      {acc.userName}
                    </td>
                    <td className="border px-4 py-2 truncate">
                      {acc.fullName || "—"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {acc.isActive ? (
                        <span className="text-green-600 font-semibold">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">Khóa</span>
                      )}
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => openEdit(acc)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedAccounts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* POPUP */}
      <AccountFormModal
        open={openModal}
        role={role}
        editing={editing}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
      />
    </div>
  );
}
