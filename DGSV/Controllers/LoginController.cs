using DGSV.Api.Data;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
            using BCrypt.Net;
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

            // ===== ADMIN =====
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

            // ===== LECTURER =====
            var lecturer = await _context.AccountLecturers
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x =>
                    x.UserName == request.UserName &&
                    x.IsActive);

            if (lecturer != null &&
                BCrypt.Net.BCrypt.Verify(request.Password, lecturer.PasswordHash))
            {
                return Ok(new
                {
                    message = "Đăng nhập thành công",
                    role = lecturer.Role.RoleName,
                    userId = lecturer.Id
                });
            }

            // ===== STUDENT =====
            var student = await _context.AccountStudents
                .Include(x => x.Role)
                .Include(x => x.Student)
                .FirstOrDefaultAsync(x =>
                    x.UserName == request.UserName &&
                    x.IsActive);

            if (student != null &&
                BCrypt.Net.BCrypt.Verify(request.Password, student.PasswordHash))
            {
                return Ok(new
                {
                    message = "Đăng nhập thành công",
                    role = student.Role.RoleName,
                    userId = student.StudentId,
                    fullName = student.Student.FullName
                });
            }
            return Unauthorized("Sai tài khoản hoặc mật khẩu");
        }
    }
}
