using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DGSV.Api.Data;

namespace DGSV.Api.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("info/{role}/{userId}")]
        public async Task<IActionResult> GetUserInfo(string role, string userId)
        {
            object userInfo;

            switch (role.ToUpper())
            {
                case "ADMIN":
                    if (!int.TryParse(userId, out int adminId))
                        return BadRequest("Invalid admin id");

                    var admin = await _context.AccountAdmins
                        .Include(a => a.Role)
                        .FirstOrDefaultAsync(a => a.Id == adminId);

                    if (admin == null) return NotFound();

                    userInfo = new
                    {
                        id = admin.Id,
                        fullName = admin.FullName,
                        userName = admin.UserName,
                        role = admin.Role.RoleName,
                        isActive = admin.IsActive
                    };
                    break;

                case "LECTURER":
                    var lecturer = await _context.Lecturers
                        .Include(l => l.Department)
                        .Include(l => l.Position)
                        .FirstOrDefaultAsync(l => l.Id == userId);

                    if (lecturer == null) return NotFound();

                    userInfo = new
                    {
                        id = lecturer.Id,
                        fullName = lecturer.FullName,
                        birthday = lecturer.Birthday,
                        email = lecturer.Email,
                        phone = lecturer.Phone,
                        department = lecturer.Department?.Name,
                        position = lecturer.Position?.Name,
                        isActive = lecturer.IsActive
                    };
                    break;

                case "STUDENT":
                    var student = await _context.Students
                        .Include(s => s.Class)
                            .ThenInclude(c => c.Course)
                        .Include(s => s.Class)
                            .ThenInclude(c => c.Department)
                        .Include(s => s.Position)
                        .FirstOrDefaultAsync(s => s.Id == userId);

                    if (student == null) return NotFound();

                    userInfo = new
                    {
                        id = student.Id,
                        fullName = student.FullName,
                        birthday = student.Birthday,
                        email = student.Email,
                        phone = student.Phone,
                        gender = (bool)student.Gender ? "Nam" : "Nữ",
                        className = student.Class?.Name,
                        course = student.Class?.Course?.Name,
                        department = student.Class?.Department?.Name,
                        position = student.Position?.Name,
                        isActive = student.IsActive
                    };
                    break;

                default:
                    return BadRequest("Invalid role");
            }

            return Ok(userInfo);
        }
    }
}
