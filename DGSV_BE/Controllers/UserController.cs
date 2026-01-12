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
                .Select(s => new UserResponseDto
                {
                    Id = s.Id,
                    FullName = s.FullName,
                    Role = "STUDENT",
                    Email = s.Email,
                    Phone = s.Phone,
                    IsActive = s.IsActive
                }).ToListAsync();

            var lecturers = await _context.Lecturers
                .Select(l => new UserResponseDto
                {
                    Id = l.Id,
                    FullName = l.FullName,
                    Role = "LECTURER",
                    Email = l.Email,
                    Phone = l.Phone,
                    IsActive = l.IsActive
                }).ToListAsync();

            var admins = await _context.AccountAdmins
                .Include(a => a.Role)
                .Select(a => new UserResponseDto
                {
                    Id = a.Id.ToString(),
                    FullName = a.FullName,
                    Role = "ADMIN",
                    Email = null,
                    Phone = null,
                    IsActive = a.IsActive
                }).ToListAsync();

            return Ok(admins.Concat(lecturers).Concat(students));
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
