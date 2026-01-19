using DGSV.Api.Data;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DGSV.Api.Controllers
{
    [Route("api/login")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public LoginController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
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

            if (admin != null && VerifyPassword(request.Password, admin.PasswordHash))
            {
                var token = GenerateToken(admin.UserName, admin.Role.RoleName, admin.Id.ToString(), admin.Role.Id);
                var permissions = await GetPermissions(admin.Role.Id);
                return Ok(new
                {
                    message = "Đăng nhập thành công",
                    role = admin.Role.RoleName,
                    userId = admin.Id,
                    token,
                    permissions
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

                if (VerifyPassword(request.Password, lecturerAccount.PasswordHash))
                {
                    var token = GenerateToken(lecturerAccount.UserName, lecturerAccount.Role.RoleName, lecturerAccount.LecturerId, lecturerAccount.Role.Id);
                    var permissions = await GetPermissions(lecturerAccount.Role.Id);
                    return Ok(new
                    {
                        message = "Đăng nhập thành công",
                        role = lecturerAccount.Role.RoleName,
                        userId = lecturerAccount.LecturerId,
                        fullName = lecturerAccount.Lecturer.FullName,
                        token,
                        permissions
                    });
                }
            }

            // ================= STUDENT =================
            var studentAccount = await _context.AccountStudents
                .Include(x => x.Role)
                .Include(x => x.Student)
                .ThenInclude(s => s.Position) // ✅ Include Position
                .FirstOrDefaultAsync(x =>
                    x.UserName == request.UserName &&
                    x.IsActive);

            if (studentAccount != null)
            {
                if (!studentAccount.Student.IsActive)
                    return Unauthorized("Tài khoản sinh viên đã bị khóa");

                if (VerifyPassword(request.Password, studentAccount.PasswordHash))
                {
                    var token = GenerateToken(studentAccount.UserName, studentAccount.Role.RoleName, studentAccount.StudentId, studentAccount.Role.Id);
                    var permissions = await GetPermissions(studentAccount.Role.Id);

                    // ✅ CHECK CLASS MONITOR POSITION
                    bool isMonitor = (studentAccount.Student.PositionId == "LT" || 
                                     (studentAccount.Student.Position != null && 
                                      studentAccount.Student.Position.Name != null &&
                                      studentAccount.Student.Position.Name.ToLower().Contains("lớp trưởng")));

                    if (isMonitor)
                    {
                        if (!permissions.Contains("CLASS_MONITOR"))
                        {
                            permissions.Add("CLASS_MONITOR");
                        }
                    }
                    else 
                    {
                        // ❌ SAFETY: If user is NOT monitor, ensure they don't have the permission
                        // (Even if the 'Student' role has it assigned in DB)
                        if (permissions.Contains("CLASS_MONITOR"))
                        {
                            permissions.Remove("CLASS_MONITOR");
                        }
                    }

                    return Ok(new
                    {
                        message = "Đăng nhập thành công",
                        role = studentAccount.Role.RoleName,
                        userId = studentAccount.StudentId,
                        fullName = studentAccount.Student.FullName,
                        token,
                        permissions
                    });
                }
            }

            return Unauthorized("Sai tài khoản hoặc mật khẩu");
        }

        // =====================================================
        // ================= PASSWORD VERIFY ===================
        // =====================================================
        private bool VerifyPassword(string inputPassword, string storedHash)
        {
            if (string.IsNullOrWhiteSpace(storedHash))
                return false;

            try
            {
                // BCrypt hash
                if (storedHash.StartsWith("$2"))
                {
                    return BCrypt.Net.BCrypt.Verify(inputPassword, storedHash);
                }

                // Fallback: mật khẩu cũ (plain text)
                return storedHash == inputPassword;
            }
            catch (BCrypt.Net.SaltParseException)
            {
                // Hash lỗi → coi như sai mật khẩu
                return false;
            }
        }


        private async Task<List<string>> GetPermissions(int roleId)
        {
            return await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => rp.Permission.PermissionCode)
                .ToListAsync();
        }

        private string GenerateToken(string userName, string roleName, string userId, int roleId)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userName),
                new Claim("RoleId", roleId.ToString()),
                new Claim("Role", roleName),
                new Claim("UserId", userId),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(120),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
