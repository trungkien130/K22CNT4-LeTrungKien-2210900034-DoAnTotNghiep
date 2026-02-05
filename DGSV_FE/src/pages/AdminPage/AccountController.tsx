import { useEffect, useState } from "react";
import api from "../../API/api";
import type { Role, Account, RegisterForm } from "../../types";
import { Trash2, Edit, Filter } from "lucide-react";
import AccountFormModal from "./AccountFormModal";
import CustomDropdown from "../../components/AdminComponent/CustomDropdown";

const ITEMS_PER_PAGE = 10;

export default function AccountController() {
  const [role, setRole] = useState<Role>("STUDENT");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<Account | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);


  const [form, setForm] = useState<RegisterForm & { isActive?: boolean }>({
    userName: "",
    password: "",
    role: "STUDENT",
    fullName: "",
    email: "",
    phone: "",
    birthday: "",
    gender: true,
    isActive: true,
  });

  /* ================= FETCH ================= */

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.getAccountsByRole(role);
      setAccounts(res.data ?? []);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [role]);

  /* ================= DELETE ================= */

  /* ================= DELETE ================= */

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa tài khoản?")) return;
    await api.deleteAccount(role, id);
    fetchAccounts();
  };

  /* ================= PAGINATION ================= */

  const paginatedAccounts = accounts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= HANDLERS ================= */

  const openEdit = (acc: Account) => {
    setEditing(acc);
    setForm({
      userName: acc.userName,
      password: "",
      role: role,
      fullName: acc.fullName || "",
      email: acc.email,
      phone: acc.phone,
      birthday: acc.birthday,
      gender: acc.gender,
      isActive: acc.isActive,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        // Update basic info
        await api.updateAccount(role, editing.id, {
          userName: form.userName,
          isActive: form.isActive,
        });

        // Update password if provided
        if (form.password) {
          await api.changePassword(role, editing.id, form.password);
        }
        
        alert("Cập nhật thành công!");
      }
      
      setOpenModal(false);
      setEditing(null);
      fetchAccounts();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi lưu!");
    }
  };

  /* ================= UI ================= */

  // ================= UI =================
  return (
    <div className="p-4 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Quản lý Tài khoản</h2>

        <div className="flex gap-4 items-center">
          <CustomDropdown
            icon={<Filter size={16} />}
            value={role}
            onChange={(val) => setRole(val as Role)}
            options={[
              { label: "Sinh viên", value: "STUDENT" },
              { label: "Giảng viên", value: "LECTURER" },
              { label: "Admin", value: "ADMIN" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full whitespace-nowrap text-sm">
          <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b">
            <tr>
              <th className="px-3 py-3 text-left w-16 font-bold">ID</th>
              <th className="px-3 py-3 text-left font-bold">Username</th>
              <th className="px-3 py-3 text-left font-bold">Họ tên</th>
              <th className="px-3 py-3 text-center w-24 font-bold sticky right-[80px] bg-gray-50 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                Trạng thái
              </th>
              <th className="px-3 py-3 text-right w-20 font-bold sticky right-0 bg-gray-50 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedAccounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-blue-50/50 transition-all duration-150 group">
                <td className="px-3 py-3 font-medium text-gray-900 text-center">{acc.id}</td>
                <td className="px-3 py-3 font-medium text-gray-700">{acc.userName}</td>
                <td className="px-3 py-3 text-gray-600">{acc.fullName || "—"}</td>

                <td className="px-3 py-3 text-center sticky right-[80px] bg-white z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      acc.isActive
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {acc.isActive ? "Hoạt động" : "Ngưng"}
                  </span>
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap sticky right-0 bg-white z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(acc)}
                      className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                      title="Sửa"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedAccounts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 text-xs">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      )}

      {/* PAGINATION (Reuse logic if needed, but wasn't explicitly complex before) */}
      
      <AccountFormModal
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
