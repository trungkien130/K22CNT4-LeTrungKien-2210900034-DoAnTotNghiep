using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DGSV.Api.Data;
using DGSV.Api.DTO;

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

            // ✅ QUAN TRỌNG
            ClassId = s.ClassId,
            ClassName = s.Class != null ? s.Class.Name : null,
            
            // ✅ Extra Info
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
            
            // ✅ Extra Info
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
        public async Task<IActionResult> UpdateUser(
            string role,
            string id,
            [FromBody] UserUpdateDto dto)
        {
            switch (role.ToUpper())
            {
                case "STUDENT":
                    {
                        var student = await _context.Students.FindAsync(id);
                        if (student == null) return NotFound();

                        student.FullName = dto.FullName;
                        student.Email = dto.Email;
                        student.Phone = dto.Phone;
                        student.IsActive = dto.IsActive;
                        var accountStudent = await _context.AccountStudents
                            .FirstOrDefaultAsync(a => a.StudentId == student.Id);

                        if (accountStudent != null)
                            accountStudent.IsActive = dto.IsActive;

                        // ✅ Update ClassId if provided
                        if (dto.ClassId.HasValue)
                        {
                            student.ClassId = dto.ClassId.Value;
                        }

                        // ✅ Update Birthday/Gender
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
                        lecturer.IsActive = dto.IsActive;
                        
                        // ✅ Update Birthday (Lecturer has no Gender)
                        lecturer.Birthday = dto.Birthday;

                        // 🔥 SYNC ACCOUNT LECTURER
                        var accountLecturer = await _context.AccountLecturers
                            .FirstOrDefaultAsync(a => a.LecturerId == lecturer.Id);

                        if (accountLecturer != null)
                            accountLecturer.IsActive = dto.IsActive;

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
                                ClassName = s.Class != null ? s.Class.Name : "", // ✅ Lấy tên lớp
                                Gender = s.Gender == null? null: (s.Gender == true ? "Nam" : "Nữ"),
                                Position = s.PositionId // ✅ Thêm chức vụ
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
                                Position = l.PositionId // ✅ Thêm chức vụ
                            })
                            .FirstOrDefaultAsync();

                        if (lecturer == null) return NotFound("Không tìm thấy giảng viên");

                        return Ok(lecturer);
                    }

                case "ADMIN":
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
        public async Task<IActionResult> DeleteUser(string role, string id)
        {
            switch (role.ToUpper())
            {
                case "STUDENT":
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
