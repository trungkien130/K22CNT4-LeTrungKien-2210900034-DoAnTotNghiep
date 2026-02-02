using DGSV.Api.Data;
using DGSV.Api.DTO;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DGSV.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FeedbackController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Feedback
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FeedbackCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var feedback = new Feedback
            {
                StudentId = dto.StudentId,
                Title = dto.Title,
                Content = dto.Content,
                CreatedAt = DateTime.Now,
                Status = "Pending"
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Gửi kiến nghị thành công", Data = feedback });
        }

        // GET: api/Feedback/my/{studentId}
        [HttpGet("my/{studentId}")]
        public async Task<IActionResult> GetMyFeedback(string studentId)
        {
            var feedbacks = await _context.Feedbacks
                .Where(x => x.StudentId == studentId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(feedbacks);
        }
    }
}
