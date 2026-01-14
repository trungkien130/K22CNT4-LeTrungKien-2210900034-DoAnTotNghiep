using DGSV.Api.Data;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Class newClass)
        {
            // Ensure Department exists if necessary, or let DB constraints handle it
            _context.Classes.Add(newClass);
            await _context.SaveChangesAsync();
            return Ok(newClass);
        }

        [HttpPut("{id}")]
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
