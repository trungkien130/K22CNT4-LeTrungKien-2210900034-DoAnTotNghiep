using DGSV.Api.Data;
using DGSV.Api.DTO;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DGSV.Api.Filters;

namespace DGSV.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnswerListController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnswerListController(AppDbContext context)
        {
            _context = context;
        }

        // ==================================================
        // GET: api/AnswerList
        // ==================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var answers = await _context.AnswerLists
                .Where(x => x.Status == true)
                .ToListAsync();

            return Ok(answers);
        }

        // ==================================================
        // GET: api/AnswerList/{id}
        // ==================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var answer = await _context.AnswerLists.FindAsync(id);
            if (answer == null)
                return NotFound("Không tìm thấy câu trả lời");

            return Ok(answer);
        }

        // ==================================================
        // GET: api/AnswerList/question/{questionId}
        // ==================================================
        [HttpGet("question/{questionId}")]
        public async Task<IActionResult> GetByQuestionId(int questionId)
        {
            var answers = await _context.AnswerLists
                .Where(a => a.QuestionId == questionId && a.Status == true)
                .ToListAsync();

            return Ok(answers);
        }

        // ==================================================
        // POST: api/AnswerList
        // ==================================================
        [HttpPost]
        [Permission("ANSWER_MANAGE")]
        public async Task<IActionResult> Create([FromBody] AnswerCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var answer = new AnswerList
            {
                ContentAnswer = dto.ContentAnswer,
                QuestionId = dto.QuestionId,
                AnswerScore = dto.AnswerScore,
                UpdateBy = dto.UpdateBy,
                Checked = dto.Checked,
                Status = true,
                CreateDate = DateTime.Now,
                UpdateDate = DateTime.Now
            };

            _context.AnswerLists.Add(answer);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Thêm câu trả lời thành công",
                data = answer
            });
        }

        // ==================================================
        // PUT: api/AnswerList/{id}
        // ==================================================
        [HttpPut("{id}")]
        [Permission("ANSWER_MANAGE")]
        public async Task<IActionResult> Update(int id, [FromBody] AnswerUpdateDto dto)
        {
            var answer = await _context.AnswerLists.FindAsync(id);
            if (answer == null)
                return NotFound("Không tìm thấy câu trả lời");

            answer.ContentAnswer = dto.ContentAnswer;
            answer.QuestionId = dto.QuestionId;
            answer.AnswerScore = dto.AnswerScore;
            answer.UpdateBy = dto.UpdateBy;
            answer.Status = dto.Status;
            answer.Checked = dto.Checked;
            answer.UpdateDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok("Cập nhật câu trả lời thành công");
        }

        // ==================================================
        // DELETE (SOFT): api/AnswerList/{id}
        // ==================================================
        [HttpDelete("{id}")]
        [Permission("ANSWER_MANAGE")]
        public async Task<IActionResult> Delete(int id)
        {
            var answer = await _context.AnswerLists.FindAsync(id);
            if (answer == null)
                return NotFound("Không tìm thấy câu trả lời");

            answer.Status = false;
            answer.UpdateDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok("Xóa câu trả lời thành công");
        }
    }
}
