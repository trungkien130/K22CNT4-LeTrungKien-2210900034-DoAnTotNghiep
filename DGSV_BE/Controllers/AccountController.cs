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
                        // Admin doesn't have extra fields usually, but we set nulls explicitly or leave defaults
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

                        // ✅ Extra Info
                        Email = x.Lecturer.Email,
                        Phone = x.Lecturer.Phone,
                        Birthday = x.Lecturer.Birthday,
                        DepartmentName = x.Lecturer.Department.Name,
                        Position = x.Lecturer.PositionId // or Name if you join Position
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

                        // ✅ Extra Info
                        Email = x.Student.Email,
                        Phone = x.Student.Phone,
                        Birthday = x.Student.Birthday,
                        Gender = x.Student.Gender,
                        ClassName = x.Student.Class.Name,
                        Position = x.Student.PositionId,
                        StudentId = x.StudentId // ✅ Map MSSV
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
        [Permission("USER_MANAGE")] // Only Admins should change other people's passwords here
        public async Task<IActionResult> ChangePassword(
            string role,
            string id,
            [FromBody] ChangePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest("Mật khẩu không hợp lệ");

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
