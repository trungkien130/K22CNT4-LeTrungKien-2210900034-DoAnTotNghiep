using DGSV.Api.Data;
using DGSV.Api.DTOs;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DGSV.Api.Filters;

namespace DGSV.Api.Controllers
{
    [ApiController]
    [Route("api/questions")]
    public class QuestionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuestionController(AppDbContext context)
        {
            _context = context;
        }

        // ==================================================
        // GET ALL
        // ==================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var questions = await _context.QuestionLists
                .Where(x => x.Status == true)
                .Include(x => x.TypeQuestion)
                .Include(x => x.GroupQuestion)
                .OrderBy(x => x.OrderBy)
            .Select(x => new QuestionResponseDto
            {
                Id = x.Id,
                ContentQuestion = x.ContentQuestion,

                TypeQuestionId = x.TypeQuestionId,
                TypeQuestionName = x.TypeQuestion.Name,

                GroupQuestionId = x.GroupQuestionId,
                GroupQuestionName = x.GroupQuestion.Name,

                OrderBy = x.OrderBy,
                UpdateBy = x.UpdateBy
            })

                .ToListAsync();

            return Ok(questions);
        }

        // ==================================================
        // GET BY ID
        // ==================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var question = await _context.QuestionLists
                .Where(x => x.Id == id && x.Status == true)
                .Include(x => x.TypeQuestion)
                .Include(x => x.GroupQuestion)
              .Select(x => new QuestionResponseDto
              {
                  Id = x.Id,
                  ContentQuestion = x.ContentQuestion,

                  TypeQuestionId = x.TypeQuestionId,
                  TypeQuestionName = x.TypeQuestion.Name,

                  GroupQuestionId = x.GroupQuestionId,
                  GroupQuestionName = x.GroupQuestion.Name,

                  OrderBy = x.OrderBy,
                  UpdateBy = x.UpdateBy
              })

                .FirstOrDefaultAsync();

            if (question == null)
                return NotFound("Không tìm thấy câu hỏi");

            return Ok(question);
        }

        // ==================================================
        // CREATE
        // ==================================================
        [HttpPost]
        [Permission("QUESTION_MANAGE")]
        public async Task<IActionResult> Create([FromBody] QuestionCreateDto dto)
        {
            var question = new QuestionList
            {
                ContentQuestion = dto.ContentQuestion,
                TypeQuestionId = dto.TypeQuestionId,
                GroupQuestionId = dto.GroupQuestionId,
                OrderBy = dto.OrderBy,
                UpdateBy = dto.UpdateBy,
                CreateDate = DateTime.Now,
                UpdateDate = DateTime.Now,
                Status = true
            };

            _context.QuestionLists.Add(question);
            await _context.SaveChangesAsync();

            return Ok("Thêm câu hỏi thành công");
        }

        // ==================================================
        // UPDATE
        // ==================================================
        [HttpPut("{id}")]
        [Permission("QUESTION_MANAGE")]
        public async Task<IActionResult> Update(int id, [FromBody] QuestionCreateDto dto)
        {
            var question = await _context.QuestionLists.FindAsync(id);
            if (question == null || question.Status == false)
                return NotFound("Không tìm thấy câu hỏi");

            question.ContentQuestion = dto.ContentQuestion;
            question.TypeQuestionId = dto.TypeQuestionId;
            question.GroupQuestionId = dto.GroupQuestionId;
            question.OrderBy = dto.OrderBy;
            question.UpdateBy = dto.UpdateBy;
            question.UpdateDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok("Cập nhật thành công");
        }

        // ==================================================
        // DELETE (SOFT)
        // ==================================================
        [HttpDelete("{id}")]
        [Permission("QUESTION_MANAGE")]
        public async Task<IActionResult> Delete(int id)
        {
            var question = await _context.QuestionLists.FindAsync(id);
            if (question == null || question.Status == false)
                return NotFound("Không tìm thấy câu hỏi");

            question.Status = false;
            question.UpdateDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok("Xóa thành công");
        }
    }
}
