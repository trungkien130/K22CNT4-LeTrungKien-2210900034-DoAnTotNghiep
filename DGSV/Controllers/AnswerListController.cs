using DGSV.Api.Data;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        // GET: api/answerlist
        // Lấy danh sách câu trả lời
        // ==================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var answers = await _context.AnswerLists.ToListAsync();
            return Ok(answers);
        }

        // ==================================================
        // GET: api/answerlist/{id}
        // Lấy câu trả lời theo Id
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
        // GET: api/answerlist/question/{questionId}
        // Lấy danh sách câu trả lời theo QuestionId
        // ==================================================
        [HttpGet("question/{questionId}")]
        public async Task<IActionResult> GetByQuestionId(int questionId)
        {
            var answers = await _context.AnswerLists
                .Where(a => a.QuestionId == questionId)
                .ToListAsync();

            return Ok(answers);
        }

        // ==================================================
        // POST: api/answerlist
        // Thêm mới câu trả lời
        // ==================================================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AnswerList model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            model.CreateDate = DateTime.Now;
            model.UpdateDate = DateTime.Now;
            model.Status = true;
            model.Checked = false;

            _context.AnswerLists.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Thêm câu trả lời thành công",
                data = model
            });
        }

        // ==================================================
        // PUT: api/answerlist/{id}
        // Cập nhật câu trả lời
        // ==================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AnswerList model)
        {
            if (id != model.Id)
                return BadRequest("Id không khớp");

            var answer = await _context.AnswerLists.FindAsync(id);
            if (answer == null)
                return NotFound("Không tìm thấy câu trả lời");

            answer.ContentAnswer = model.ContentAnswer;
            answer.AnswerScore = model.AnswerScore;
            answer.QuestionId = model.QuestionId;
            answer.UpdateBy = model.UpdateBy;
            answer.Checked = model.Checked;
            answer.Status = model.Status;
            answer.UpdateDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok("Cập nhật câu trả lời thành công");
        }

        // ==================================================
        // DELETE: api/answerlist/{id}
        // Xóa câu trả lời (xóa mềm)
        // ==================================================
        [HttpDelete("{id}")]
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
