using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DGSV.Api.Data;
using DGSV.Api.DTO;
using DGSV.Api.Filters;

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


        // ==================================================
        // GET: api/user/all
        // ==================================================
       [HttpGet("all")]
       [Permission("USER_VIEW")]
public async Task<IActionResult> GetAllUsers()
{
    var students = await _context.Students
        .Include(s => s.Class)
        .Select(s => new UserResponseDto
        {
            Id = s.Id,
            FullName = s.FullName,
            Role = "STUDENT",
            Email = s.Email,
            Phone = s.Phone,
            ClassId = s.ClassId,
            ClassName = s.Class != null ? s.Class.Name : null,
            Birthday = s.Birthday,
            Gender = s.Gender,
            Position = s.PositionId,
            IsActive = s.IsActive
        }).ToListAsync();

    var lecturers = await _context.Lecturers
        .Include(l => l.Department)
        .Select(l => new UserResponseDto
        {
            Id = l.Id,
            FullName = l.FullName,
            Role = "LECTURER",
            Email = l.Email,
            Phone = l.Phone,
            Birthday = l.Birthday,
            DepartmentName = l.Department != null ? l.Department.Name : null,
            Position = l.PositionId,
            IsActive = l.IsActive
        }).ToListAsync();

    var admins = await _context.AccountAdmins
        .Select(a => new UserResponseDto
        {
            Id = a.Id.ToString(),
            FullName = a.FullName,
            Role = "ADMIN",
            IsActive = a.IsActive
        }).ToListAsync();

    return Ok(admins.Concat(lecturers).Concat(students));
}
// ==================================================
// GET: api/user/classes
// ==================================================
[HttpGet("classes")]
public async Task<IActionResult> GetClasses()
{
    Console.WriteLine("Fetching classes...");
    var classes = await _context.Classes
        .Select(c => new { c.Id, c.Name })
        .ToListAsync();
    Console.WriteLine($"Found {classes.Count} classes.");
    return Ok(classes);
}
        // ==================================================
        // PUT: api/user/{role}/{id}
        // ==================================================
        [HttpPut("{role}/{id}")]
        // [Permission("USER_MANAGE")] - Removed to allow self-update
        public async Task<IActionResult> UpdateUser(
            string role,
            string id,
            [FromBody] UserUpdateDto dto)
        {
            // 1. Check Permissions
            var currentUserId = User.FindFirst("UserId")?.Value;

            // Allow if updating self (Case Insensitive)
            if (currentUserId == null || !currentUserId.Equals(id, StringComparison.OrdinalIgnoreCase))
            {
                // Otherwise require USER_MANAGE permission
                var roleIdStr = User.FindFirst("RoleId")?.Value;
                if (!int.TryParse(roleIdStr, out int roleId))
                    return Forbid();

                var hasPermission = await _context.RolePermissions
                    .AnyAsync(rp => rp.RoleId == roleId && rp.Permission.PermissionCode == "USER_MANAGE");

                if (!hasPermission)
                    return Forbid();
            }

            switch (role.ToUpper())
            {
                case "STUDENT":
                case "CLASS_MONITOR":
                case "MONITOR":
                    {
                        var student = await _context.Students.FindAsync(id);
                        if (student == null) return NotFound();

                        student.FullName = dto.FullName;
                        student.Email = dto.Email;
                        student.Phone = dto.Phone;
                        // Only Admin/Manager can change status (Active/Inactive)
                        // User updating themselves cannot ban themselves (usually)
                        // Ideally we should separate DTOs or check permission for IsActive change
                        // For now, keeping as is but we might want to restrict IsActive change for self-update
                        
                        // Fix: If self-update, prevent IsActive change unless Admin?
                        // The user request was just to "allow update", I'll stick to that.
                        // Only allow status change if not self (meaning it's an admin/manager)
                        if (!currentUserId.Equals(id, StringComparison.OrdinalIgnoreCase)) 
                        {
                            student.IsActive = dto.IsActive;
                            var accountStudent = await _context.AccountStudents.FirstOrDefaultAsync(a => a.StudentId == student.Id);
                            if (accountStudent != null) accountStudent.IsActive = dto.IsActive;
                        }

                        if (dto.ClassId.HasValue)
                        {
                            student.ClassId = dto.ClassId.Value;
                        }

                        student.Birthday = dto.Birthday;
                        student.Gender = dto.Gender;

                        break;
                    }

                case "LECTURER":
                    {
                        var lecturer = await _context.Lecturers.FindAsync(id);
                        if (lecturer == null) return NotFound();

                        lecturer.FullName = dto.FullName;
                        lecturer.Email = dto.Email;
                        lecturer.Phone = dto.Phone;
                        
                        if (!currentUserId.Equals(id, StringComparison.OrdinalIgnoreCase))
                        {
                            lecturer.IsActive = dto.IsActive;
                            var accountLecturer = await _context.AccountLecturers.FirstOrDefaultAsync(a => a.LecturerId == lecturer.Id);
                            if (accountLecturer != null) accountLecturer.IsActive = dto.IsActive;
                        }
                        
                        lecturer.Birthday = dto.Birthday;

                        break;
                    }

                case "ADMIN":
                case "SUPER_ADMIN":
                    {
                        if (!int.TryParse(id, out int adminId))
                            return BadRequest("Id admin không hợp lệ");

                        var admin = await _context.AccountAdmins.FindAsync(adminId);
                        if (admin == null) return NotFound();

                        admin.FullName = dto.FullName;
                        
                        if (!currentUserId.Equals(id, StringComparison.OrdinalIgnoreCase))
                        {
                            admin.IsActive = dto.IsActive;
                        }

                        break;
                    }

                default:
                    return BadRequest("Role không hợp lệ");
            }

            await _context.SaveChangesAsync();
            return Ok("Cập nhật thành công");
        }
        // ==================================================
        // GET: api/user/info/{role}/{id}
        // ==================================================
        [HttpGet("info/{role}/{id}")]
        public async Task<IActionResult> GetUserDetail(string role, string id)
        {
            switch (role.ToUpper())
            {
                case "STUDENT":
                case "CLASS_MONITOR":
                case "MONITOR":
                    {
                        var student = await _context.Students
                            .Where(s => s.Id == id)
                            .Select(s => new
                            {
                                Id = s.Id,
                                FullName = s.FullName,
                                Email = s.Email,
                                Phone = s.Phone,
                                IsActive = s.IsActive,
                                Role = "STUDENT",
                                Birthday = s.Birthday,
                                ClassId = s.ClassId,
                                ClassName = s.Class != null ? s.Class.Name : "",
                                Gender = s.Gender == null? null: (s.Gender == true ? "Nam" : "Nữ"),
                                Position = s.PositionId
                            })
                            .FirstOrDefaultAsync();

                        if (student == null) return NotFound("Không tìm thấy sinh viên");

                        return Ok(student);
                    }

                case "LECTURER":
                    {
                        var lecturer = await _context.Lecturers
                            .Where(l => l.Id == id)
                            .Select(l => new
                            {
                                Id = l.Id,
                                FullName = l.FullName,
                                Email = l.Email,
                                Phone = l.Phone,
                                IsActive = l.IsActive,
                                Role = "LECTURER",
                                Birthday = l.Birthday,
                                Position = l.PositionId
                            })
                            .FirstOrDefaultAsync();

                        if (lecturer == null) return NotFound("Không tìm thấy giảng viên");

                        return Ok(lecturer);
                    }

                case "ADMIN":
                case "SUPER_ADMIN":
                    {
                        if (!int.TryParse(id, out int adminId))
                            return BadRequest("Id admin không hợp lệ");

                        var admin = await _context.AccountAdmins
                            .Where(a => a.Id == adminId)
                            .Select(a => new
                            {
                                Id = a.Id,
                                FullName = a.FullName,
                                IsActive = a.IsActive,
                                Role = "ADMIN"
                            })
                            .FirstOrDefaultAsync();

                        if (admin == null) return NotFound("Không tìm thấy admin");

                        return Ok(admin);
                    }

                default:
                    return BadRequest("Role không hợp lệ");
            }
        }

        // ==================================================
        // DELETE (SOFT): api/user/{role}/{id}
        // ==================================================
        [HttpDelete("{role}/{id}")]
        [Permission("USER_MANAGE")]
        public async Task<IActionResult> DeleteUser(string role, string id)
        {
            switch (role.ToUpper())
            {
                case "STUDENT":
                case "CLASS_MONITOR":
                case "MONITOR":
                    {
                        var student = await _context.Students.FindAsync(id);
                        if (student == null) return NotFound();

                        student.IsActive = false;

                        var accountStudent = await _context.AccountStudents
                            .FirstOrDefaultAsync(a => a.StudentId == student.Id);

                        if (accountStudent != null)
                            accountStudent.IsActive = false;

                        break;
                    }

                case "LECTURER":
                    {
                        var lecturer = await _context.Lecturers.FindAsync(id);
                        if (lecturer == null) return NotFound();
                        lecturer.IsActive = false;
                        var accountLecturer = await _context.AccountLecturers
                            .FirstOrDefaultAsync(a => a.LecturerId == lecturer.Id);
                        if (accountLecturer != null)
                            accountLecturer.IsActive = false;
                        break;
                    }
                case "ADMIN":
                case "SUPER_ADMIN":
                    {
                        if (!int.TryParse(id, out int adminId))
                            return BadRequest();
                        var admin = await _context.AccountAdmins.FindAsync(adminId);
                        if (admin == null) return NotFound();
                        admin.IsActive = false;
                        break;
                    }

                default:
                    return BadRequest("Role không hợp lệ");
            }
            await _context.SaveChangesAsync();
            return Ok("Người dùng đã bị khóa");
        }
    }
}
