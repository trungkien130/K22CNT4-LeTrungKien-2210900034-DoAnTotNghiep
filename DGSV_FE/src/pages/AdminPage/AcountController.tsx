import { useEffect, useState, useRef } from "react";
import api from "../../API/api";
import type { Role, Account, RegisterForm } from "../../types";
import { Trash2, Edit, Plus, Upload, Filter } from "lucide-react";
import AccountFormModal from "./AcountFormModal";
import CustomDropdown from "../../components/AdminComponent/CustomDropdown";

const ITEMS_PER_PAGE = 10;

export default function AccountController() {
  const [role, setRole] = useState<Role>("STUDENT");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<Account | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  /* ================= ADD ================= */

  const openAdd = () => {
    setEditing(null);
    setForm({
      userName: "",
      password: "",
      role,
      fullName: "",
      email: "",
      phone: "",
      birthday: "",
      gender: true,
      isActive: true,
    });
    setOpenModal(true);
  };

  /* ================= EDIT ================= */

  const openEdit = (acc: Account) => {
    setEditing(acc);
    setForm({
      userName: acc.userName,
      password: "",
      role,
      fullName: acc.fullName ?? "",
      email: "",
      phone: "",
      birthday: "",
      gender: true,
      isActive: acc.isActive,
    });
    setOpenModal(true);
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    try {
      if (!editing) {
        // ===== ADD =====
        await api.register({
          ...form,
          role,
          birthday: form.birthday
            ? new Date(form.birthday).toISOString()
            : undefined,
        });
      } else {
        // ===== UPDATE ACCOUNT =====
        await api.updateAccount(role, editing.id, {
          userName: form.userName,
          isActive: form.isActive,
        });

        // ===== CHANGE PASSWORD =====
        if (form.password?.trim()) {
          await api.changePassword(role, editing.id, form.password);
        }
      }

      setOpenModal(false);
      fetchAccounts();
    } catch {
      alert("Thao tác thất bại");
    }
  };

  /* ================= IMPORT EXCEL ================= */

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await api.importExcel(file);
      alert("Import Excel thành công");
      fetchAccounts();
    } catch {
      alert("Import Excel thất bại");
    } finally {
      e.target.value = "";
    }
  };

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

  /* ================= UI ================= */

  // ================= UI =================
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Quản lý Tài khoản</h2>

        <div className="flex gap-4 items-center">
          <CustomDropdown
            icon={<Filter size={18} />}
            value={role}
            onChange={(val) => setRole(val as Role)}
            options={[
              { label: "Sinh viên", value: "STUDENT" },
              { label: "Giảng viên", value: "LECTURER" },
              { label: "Admin", value: "ADMIN" },
            ]}
          />

          <div className="flex gap-2">
            <button
              onClick={openAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={18} /> Thêm mới
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
            >
              <Upload size={18} /> Import Excel
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportExcel}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left w-16">ID</th>
              <th className="px-6 py-3 text-left">Username</th>
              <th className="px-6 py-3 text-left">Họ tên</th>

              <th className="px-6 py-3 text-center w-32">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right w-32">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedAccounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 text-center">{acc.id}</td>
                <td className="px-6 py-4 font-medium text-gray-700">{acc.userName}</td>
                <td className="px-6 py-4 text-gray-600">{acc.fullName || "—"}</td>

                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      acc.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {acc.isActive ? "Hoạt động" : "Ngưng"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => openEdit(acc)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                    title="Sửa"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
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
