using DGSV.Api.Data;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DGSV.Api.Controllers
{
    [Route("api/login")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LoginController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Thiếu UserName hoặc Password");
            }

            // ================= ADMIN =================
            var admin = await _context.AccountAdmins
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x =>
                    x.UserName == request.UserName &&
                    x.IsActive);

            if (admin != null &&
                BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
            {
                return Ok(new
                {
                    message = "Đăng nhập thành công",
                    role = admin.Role.RoleName,
                    userId = admin.Id
                });
            }

            // ================= LECTURER =================
            var lecturerAccount = await _context.AccountLecturers
                .Include(x => x.Role)
                .Include(x => x.Lecturer)
                .FirstOrDefaultAsync(x =>
                    x.UserName == request.UserName &&
                    x.IsActive);

            if (lecturerAccount != null)
            {
                if (!lecturerAccount.Lecturer.IsActive)
                    return Unauthorized("Tài khoản giảng viên đã bị khóa");

                if (BCrypt.Net.BCrypt.Verify(request.Password, lecturerAccount.PasswordHash))
                {
                    return Ok(new
                    {
                        message = "Đăng nhập thành công",
                        role = lecturerAccount.Role.RoleName,
                        userId = lecturerAccount.LecturerId,
                        fullName = lecturerAccount.Lecturer.FullName
                    });
                }
            }

            // ================= STUDENT =================
            var studentAccount = await _context.AccountStudents
                .Include(x => x.Role)
                .Include(x => x.Student)
                .FirstOrDefaultAsync(x =>
                    x.UserName == request.UserName &&
                    x.IsActive);

            if (studentAccount != null)
            {
                if (!studentAccount.Student.IsActive)
                    return Unauthorized("Tài khoản sinh viên đã bị khóa");

                if (BCrypt.Net.BCrypt.Verify(request.Password, studentAccount.PasswordHash))
                {
                    return Ok(new
                    {
                        message = "Đăng nhập thành công",
                        role = studentAccount.Role.RoleName,
                        userId = studentAccount.StudentId,
                        fullName = studentAccount.Student.FullName
                    });
                }
            }

            return Unauthorized("Sai tài khoản hoặc mật khẩu");
        }
    }
}
