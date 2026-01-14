using DGSV.Api.Data;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DGSV.Api.Controllers
{
    [Route("api/departments")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DepartmentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.Departments.ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Department department)
        {
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
            return Ok(department);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Department department)
        {
            var existing = await _context.Departments.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = department.Name;
            
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.Departments.FindAsync(id);
            if (existing == null) return NotFound();

            _context.Departments.Remove(existing);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
