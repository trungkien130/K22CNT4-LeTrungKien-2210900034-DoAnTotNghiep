using DGSV.Api.Data;
using DGSV.Api.Models;
using DGSV.Api.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DGSV.Api.Filters;

namespace DGSV.Api.Controllers
{
    [Route("api/classes")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClassController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {

                var classes = await _context.Classes
                    .Include(c => c.Department)
                    .Select(c => new 
                    {
                        c.Id,
                        c.Name,
                        c.CourseId,
                        c.DepartmentId,
                        DepartmentName = c.Department != null ? c.Department.Name : "",
                        c.IsActive
                    })
                    .ToListAsync();
                return Ok(classes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("{className}/students")]
        public async Task<IActionResult> GetStudentsByClassName(string className)
        {
            var students = await _context.Students
                .Include(s => s.Class)

                .Where(s => s.Class.Name == className)
                .Select(s => new DGSV.Api.DTO.UserResponseDto
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
                })
                .ToListAsync();

            return Ok(students);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ClassCreateDto dto)
        {
            if (dto.DepartmentId <= 0)
                return BadRequest("Vui lòng chọn Khoa");

            var deptExists = await _context.Departments.AnyAsync(d => d.Id == dto.DepartmentId);
            if (!deptExists)
                return BadRequest("Khoa không tồn tại");

            // Validate CourseId
            if (!string.IsNullOrEmpty(dto.CourseId))
            {
                var courseExists = await _context.Courses.AnyAsync(c => c.Id == dto.CourseId);
                if (!courseExists)
                    return BadRequest($"Khóa '{dto.CourseId}' không tồn tại");
            }

            try 
            {
                var newClass = new Class
                {
                    Name = dto.Name,
                    CourseId = string.IsNullOrEmpty(dto.CourseId) ? null : dto.CourseId,
                    DepartmentId = dto.DepartmentId,
                    IsActive = dto.IsActive
                };

                _context.Classes.Add(newClass);
                await _context.SaveChangesAsync();
                return Ok(newClass);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message + " " + ex.InnerException?.Message);
            }
        }

        [HttpPut("{id}")]
        [Permission("CLASS_MANAGE")]
        public async Task<IActionResult> Update(int id, [FromBody] ClassCreateDto dto)
        {
            if (dto.DepartmentId <= 0)
                return BadRequest("Vui lòng chọn Khoa");

            var deptExists = await _context.Departments.AnyAsync(d => d.Id == dto.DepartmentId);
            if (!deptExists)
                return BadRequest("Khoa không tồn tại");

            // Validate CourseId
            if (!string.IsNullOrEmpty(dto.CourseId))
            {
                var courseExists = await _context.Courses.AnyAsync(c => c.Id == dto.CourseId);
                if (!courseExists)
                    return BadRequest($"Khóa '{dto.CourseId}' không tồn tại");
            }

            var existing = await _context.Classes.FindAsync(id);
            if (existing == null) return NotFound();

            try
            {
                existing.Name = dto.Name;
                existing.CourseId = string.IsNullOrEmpty(dto.CourseId) ? null : dto.CourseId;
                existing.DepartmentId = dto.DepartmentId;
                existing.IsActive = dto.IsActive;

                await _context.SaveChangesAsync();
                return Ok(existing);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message + " " + ex.InnerException?.Message);
            }
        }

        [HttpDelete("{id}")]
        [Permission("CLASS_MANAGE")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.Classes.FindAsync(id);
            if (existing == null) return NotFound();

            _context.Classes.Remove(existing);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
