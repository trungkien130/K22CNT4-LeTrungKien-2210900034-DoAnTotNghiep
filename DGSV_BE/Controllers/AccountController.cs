using DGSV.Api.Data;
using DGSV.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DGSV.Api.Filters;

namespace DGSV.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AccountController(AppDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // ==================== GET BY ROLE ====================
        // =====================================================
        [HttpGet("{role}")]
        [Permission("USER_VIEW")]
        public async Task<IActionResult> GetByRole(string role)
        {
            role = role.ToLower();

            return role switch
            {
                "admin" => Ok(await _context.AccountAdmins
                    .Include(x => x.Role)
                    .Select(x => new AccountResponseDto
                    {
                        Id = x.Id,
                        UserName = x.UserName,
                        FullName = x.FullName,
                        IsActive = x.IsActive,
                        Role = x.Role.RoleName,
                        PasswordHash = x.PasswordHash
                    }).ToListAsync()),

                "lecturer" => Ok(await _context.AccountLecturers
                    .Include(x => x.Role)
                    .Include(x => x.Lecturer)
                        .ThenInclude(l => l.Department)
                    .Select(x => new AccountResponseDto
                    {
                        Id = x.Id,
                        UserName = x.UserName,
                        FullName = x.Lecturer.FullName,
                        IsActive = x.IsActive,
                        Role = x.Role.RoleName,

                        Email = x.Lecturer.Email,
                        Phone = x.Lecturer.Phone,
                        Birthday = x.Lecturer.Birthday,
                        DepartmentName = x.Lecturer.Department.Name,
                        Position = x.Lecturer.PositionId,
                        PasswordHash = x.PasswordHash
                    }).ToListAsync()),

                "student" => Ok(await _context.AccountStudents
                    .Include(x => x.Role)
                    .Include(x => x.Student)
                        .ThenInclude(s => s.Class)
                    .Select(x => new AccountResponseDto
                    {
                        Id = x.Id,
                        UserName = x.UserName,
                        FullName = x.Student.FullName,
                        IsActive = x.IsActive,
                        Role = x.Role.RoleName,

                        ClassName = x.Student.Class.Name,
                        Position = x.Student.PositionId,
                        StudentId = x.StudentId,
                        PasswordHash = x.PasswordHash
                    }).ToListAsync()),

                _ => BadRequest("Role không hợp lệ")
            };
        }

        // =====================================================
        // ==================== UPDATE =========================
        // =====================================================
        [HttpPut("{role}/{id}")]
        [Permission("USER_MANAGE")]
        public async Task<IActionResult> Update(
            string role,
            int id,
            AccountUpdateDto dto)
        {
            role = role.ToLower();

            // ===== CHECK TRÙNG USERNAME =====
            bool isDuplicate = role switch
            {
                "admin" => await _context.AccountAdmins
                    .AnyAsync(x => x.UserName == dto.UserName && x.Id != id),

                "lecturer" => await _context.AccountLecturers
                    .AnyAsync(x => x.UserName == dto.UserName && x.Id != id),

                "student" => await _context.AccountStudents
                    .AnyAsync(x => x.UserName == dto.UserName && x.Id != id),

                _ => false
            };

            if (isDuplicate)
                return BadRequest("Username đã tồn tại");

            // ===== UPDATE =====
            if (role == "admin")
            {
                var acc = await _context.AccountAdmins.FindAsync(id);
                if (acc == null) return NotFound();

                acc.UserName = dto.UserName;
                acc.FullName = dto.FullName;
                acc.IsActive = dto.IsActive;
            }
            else if (role == "lecturer")
            {
                var acc = await _context.AccountLecturers.FindAsync(id);
                if (acc == null) return NotFound();

                acc.UserName = dto.UserName;
                acc.IsActive = dto.IsActive;
            }
            else if (role == "student")
            {
                var acc = await _context.AccountStudents.FindAsync(id);
                if (acc == null) return NotFound();

                acc.UserName = dto.UserName;
                acc.IsActive = dto.IsActive;
            }
            else
            {
                return BadRequest("Role không hợp lệ");
            }

            await _context.SaveChangesAsync();
            return Ok("Cập nhật tài khoản thành công");
        }

        // =====================================================
        // ================= CHANGE PASSWORD ===================
        // =====================================================
        [HttpPut("{role}/{id}/change-password")]
        // [Permission("USER_MANAGE")] - Removed to allow self-change
        public async Task<IActionResult> ChangePassword(
            string role,
            string id,
            [FromBody] ChangePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest("Mật khẩu không hợp lệ");

            // 1. Check Permissions
            var currentUserId = User.FindFirst("UserId")?.Value;
            
            Console.WriteLine($"[DEBUG] ChangePassword - Role: {role}, ID: {id}, CurrentUserId: {currentUserId}");

            // Allow if updating self (Case Insensitive)
            if (currentUserId == null || !currentUserId.Equals(id, StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine($"[DEBUG] ID Mismatch or Null. Check USER_MANAGE.");
                // Otherwise require USER_MANAGE permission
                var roleIdStr = User.FindFirst("RoleId")?.Value;
                if (!int.TryParse(roleIdStr, out int roleId))
                {
                    Console.WriteLine($"[DEBUG] RoleId not found.");
                    return Forbid();
                }

                var hasPermission = await _context.RolePermissions
                    .AnyAsync(rp => rp.RoleId == roleId && rp.Permission.PermissionCode == "USER_MANAGE");

                if (!hasPermission)
                {
                    Console.WriteLine($"[DEBUG] No USER_MANAGE permission.");
                    return Forbid();
                }
            }

            role = role.ToLower();
            var hash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            if (role == "admin")
            {
                if (!int.TryParse(id, out int adminId)) return BadRequest("ID Admin phải là số");
                var acc = await _context.AccountAdmins.FindAsync(adminId);
                if (acc == null) return NotFound();
                acc.PasswordHash = hash;
            }
            else if (role == "lecturer")
            {
                var acc = await _context.AccountLecturers.FirstOrDefaultAsync(x => x.LecturerId == id);
                if (acc == null) return NotFound("Tài khoản giảng viên không tồn tại");
                acc.PasswordHash = hash;
            }
            else if (role == "student")
            {
                var acc = await _context.AccountStudents.FirstOrDefaultAsync(x => x.StudentId == id);
                if (acc == null) return NotFound("Tài khoản sinh viên không tồn tại");
                acc.PasswordHash = hash;
            }
            else
            {
                return BadRequest("Role không hợp lệ");
            }

            await _context.SaveChangesAsync();
            return Ok("Đổi mật khẩu thành công");
        }

        // =====================================================
        // ==================== DELETE =========================
        // =====================================================
        [HttpDelete("{role}/{id}")]
        [Permission("USER_MANAGE")]
        public async Task<IActionResult> Delete(string role, int id)
        {
            role = role.ToLower();

            if (role == "admin")
            {
                var acc = await _context.AccountAdmins.FindAsync(id);
                if (acc == null) return NotFound();
                _context.AccountAdmins.Remove(acc);
            }
            else if (role == "lecturer")
            {
                var acc = await _context.AccountLecturers.FindAsync(id);
                if (acc == null) return NotFound();
                _context.AccountLecturers.Remove(acc);
            }
            else if (role == "student")
            {
                var acc = await _context.AccountStudents.FindAsync(id);
                if (acc == null) return NotFound();
                _context.AccountStudents.Remove(acc);
            }
            else
            {
                return BadRequest("Role không hợp lệ");
            }

            await _context.SaveChangesAsync();
            return Ok("Xóa tài khoản thành công");
        }
    }
}
