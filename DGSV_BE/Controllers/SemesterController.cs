using DGSV.Api.Data;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DGSV.Api.Filters;

namespace DGSV.Api.Controllers
{
    [Route("api/semesters")]
    [ApiController]
    public class SemesterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SemesterController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.Semesters.ToListAsync());
        }

        [HttpPost]
        [Permission("SEM_MANAGE")]
        public async Task<IActionResult> Create([FromBody] Semester semester)
        {
            if (string.IsNullOrWhiteSpace(semester.Name))
                return BadRequest("Invalid data");

            if (string.IsNullOrWhiteSpace(semester.Name))
                return BadRequest("Invalid data");

            _context.Semesters.Add(semester);
            await _context.SaveChangesAsync();
            return Ok(semester);
        }

        [HttpPut("{id}")]
        [Permission("SEM_MANAGE")]
        public async Task<IActionResult> Update(int id, [FromBody] Semester semester)
        {
            var existing = await _context.Semesters.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = semester.Name;
            existing.SchoolYear = semester.SchoolYear;
            existing.DateOpenStudent = semester.DateOpenStudent;
            existing.DateEndStudent = semester.DateEndStudent;
            existing.DateEndClass = semester.DateEndClass;
            existing.DateEndLecturer = semester.DateEndLecturer;
            existing.IsActive = semester.IsActive;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        [Permission("SEM_MANAGE")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.Semesters.FindAsync(id);
            if (existing == null) return NotFound();

            _context.Semesters.Remove(existing);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
