using DGSV.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DGSV.Api.Data
{
    public static class DbSeeder
    {
        public static void Seed(AppDbContext context)
        {
            // Ensure DB is created
            context.Database.EnsureCreated();

            // Seed Permissions
            if (!context.Permissions.Any(p => p.PermissionCode == "CLASS_MONITOR"))
            {
                context.Permissions.Add(new Permission
                {
                    PermissionCode = "CLASS_MONITOR",
                    PermissionName = "Lớp trưởng (Xem chi tiết đánh giá)",
                    Module = "CLASS MANAGEMENT"
                });
                context.SaveChanges();
            }

            // You can add other missing permissions similarly here
            var defaults = new List<Permission>
            {
                new Permission { PermissionCode = "USER_VIEW", PermissionName = "Xem danh sách người dùng", Module = "USER MANAGEMENT" },
                new Permission { PermissionCode = "USER_CREATE", PermissionName = "Thêm người dùng mới", Module = "USER MANAGEMENT" },
                new Permission { PermissionCode = "USER_EDIT", PermissionName = "Sửa thông tin người dùng", Module = "USER MANAGEMENT" },
                new Permission { PermissionCode = "USER_DELETE", PermissionName = "Xóa người dùng", Module = "USER MANAGEMENT" },
                
                new Permission { PermissionCode = "CLASS_MANAGE", PermissionName = "Quản lý lớp học", Module = "CLASS MANAGEMENT" },
                new Permission { PermissionCode = "CLASS_VIEW_LIST", PermissionName = "Xem danh sách lớp", Module = "CLASS MANAGEMENT" },

                new Permission { PermissionCode = "SEM_MANAGE", PermissionName = "Quản lý học kỳ", Module = "SEMESTER MANAGEMENT" },

                new Permission { PermissionCode = "DEPT_MANAGE", PermissionName = "Quản lý Khoa/Bộ môn", Module = "DEPARTMENT MANAGEMENT" },

                new Permission { PermissionCode = "EVAL_SELF", PermissionName = "Tự đánh giá", Module = "EVALUATION" },
                new Permission { PermissionCode = "EVAL_HISTORY_VIEW", PermissionName = "Xem lịch sử đánh giá", Module = "EVALUATION" },
                
                new Permission { PermissionCode = "LECTURER_VIEW_CLASSES", PermissionName = "Xem lớp được phân công", Module = "LECTURER" },
                new Permission { PermissionCode = "LECTURER_EVAL_STUDENT", PermissionName = "Đánh giá sinh viên", Module = "LECTURER" },

                new Permission { PermissionCode = "QUESTION_MANAGE", PermissionName = "Quản lý Ngân hàng câu hỏi", Module = "EVALUATION" },
                new Permission { PermissionCode = "ANSWER_MANAGE", PermissionName = "Quản lý Bộ câu trả lời (Scores)", Module = "EVALUATION" },
                
                new Permission { PermissionCode = "PERMISSION_MANAGE", PermissionName = "Quản lý phân quyền", Module = "SYSTEM" },
                new Permission { PermissionCode = "SYSTEM_ADMIN", PermissionName = "Quản trị hệ thống", Module = "SYSTEM" }
            };

            bool changed = false;
            foreach (var def in defaults)
            {
                if (!context.Permissions.Any(p => p.PermissionCode == def.PermissionCode))
                {
                    context.Permissions.Add(def);
                    changed = true;
                }
            }

            if (changed) context.SaveChanges();
        }
    }
}
