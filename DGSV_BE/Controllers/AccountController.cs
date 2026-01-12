using DGSV.Api.Data;
using DGSV.Api.DTOs;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        // ==================== GET ALL ========================
        // =====================================================
        [HttpGet("{role}")]
        public async Task<IActionResult> GetByRole(string role)
        {
            role = role.ToLower();

            return role switch
            {
                "admin" => Ok(await _context.AccountAdmins
                    .Include(x => x.Role)
                    .Select(x => new
                    {
                        x.Id,
                        x.UserName,
                        x.FullName,
                        x.IsActive,
                        Role = x.Role.RoleName
                    }).ToListAsync()),

                "lecturer" => Ok(await _context.AccountLecturers
                    .Include(x => x.Role)
                    .Include(x => x.Lecturer)
                    .Select(x => new
                    {
                        x.Id,
                        x.UserName,
                        FullName = x.Lecturer.FullName,
                        x.IsActive,
                        Role = x.Role.RoleName
                    }).ToListAsync()),

                "student" => Ok(await _context.AccountStudents
                    .Include(x => x.Role)
                    .Include(x => x.Student)
                    .Select(x => new
                    {
                        x.Id,
                        x.UserName,
                        FullName = x.Student.FullName,
                        x.IsActive,
                        Role = x.Role.RoleName
                    }).ToListAsync()),

                _ => BadRequest("Role không hợp lệ")
            };
        }

        // =====================================================
        // ==================== UPDATE =========================
        // =====================================================
        [HttpPut("{role}/{id}")]
        public async Task<IActionResult> Update(
    string role,
    int id,
    AccountUpdateDto dto)
        {
            role = role.ToLower();

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
        public async Task<IActionResult> ChangePassword(
            string role,
            int id,
            ChangePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest("Mật khẩu không hợp lệ");

            role = role.ToLower();
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            if (role == "admin")
            {
                var acc = await _context.AccountAdmins.FindAsync(id);
                if (acc == null) return NotFound();
                acc.PasswordHash = passwordHash;
            }
            else if (role == "lecturer")
            {
                var acc = await _context.AccountLecturers.FindAsync(id);
                if (acc == null) return NotFound();
                acc.PasswordHash = passwordHash;
            }
            else if (role == "student")
            {
                var acc = await _context.AccountStudents.FindAsync(id);
                if (acc == null) return NotFound();
                acc.PasswordHash = passwordHash;
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
        public async Task<IActionResult> Delete(string role, int id)
        {
            role = role.ToLower();

            if (role == "admin")
                _context.AccountAdmins.Remove(await _context.AccountAdmins.FindAsync(id));
            else if (role == "lecturer")
                _context.AccountLecturers.Remove(await _context.AccountLecturers.FindAsync(id));
            else if (role == "student")
                _context.AccountStudents.Remove(await _context.AccountStudents.FindAsync(id));
            else
                return BadRequest("Role không hợp lệ");

            await _context.SaveChangesAsync();
            return Ok("Xóa tài khoản thành công");
        }
    }
}
