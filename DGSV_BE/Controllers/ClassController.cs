using DGSV.Api.Data;
using DGSV.Api.Models;
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
                // Include Department for display if needed
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
                .Where(s => s.Class.Name == className) // Filter by class name
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
        [Permission("CLASS_MANAGE")]
        public async Task<IActionResult> Create([FromBody] Class newClass)
        {
            // Ensure Department exists if necessary, or let DB constraints handle it
            _context.Classes.Add(newClass);
            await _context.SaveChangesAsync();
            return Ok(newClass);
        }

        [HttpPut("{id}")]
        [Permission("CLASS_MANAGE")]
        public async Task<IActionResult> Update(int id, [FromBody] Class updatedClass)
        {
            var existing = await _context.Classes.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = updatedClass.Name;
            existing.CourseId = updatedClass.CourseId;
            existing.DepartmentId = updatedClass.DepartmentId;
            existing.IsActive = updatedClass.IsActive;

            await _context.SaveChangesAsync();
            return Ok(existing);
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
