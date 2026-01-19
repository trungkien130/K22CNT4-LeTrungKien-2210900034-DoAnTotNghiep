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
    public class EvaluationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EvaluationsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Evaluations
        [HttpPost]
        [Permission("EVAL_SELF")]
        public async Task<IActionResult> Create([FromBody] EvaluationCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var transaction = _context.Database.BeginTransaction();
            try
            {
                // 1. Clear old evaluation for this semester (Replace strategy)
                var oldAnswers = await _context.SelfAnswers
                    .Where(x => x.StudentId == dto.StudentId && x.SemesterId == dto.SemesterId)
                    .ToListAsync();
                
                if (oldAnswers.Any())
                {
                    _context.SelfAnswers.RemoveRange(oldAnswers);
                }

                // 2. Add new
                var newAnswers = new List<SelfAnswer>();
                if (dto.Details != null)
                {
                    foreach (var d in dto.Details)
                    {
                        // Duplicate rows for Count
                        for (int i = 0; i < d.Count; i++)
                        {
                            newAnswers.Add(new SelfAnswer
                            {
                                StudentId = dto.StudentId,
                                SemesterId = dto.SemesterId,
                                AnswerId = d.AnswerId
                            });
                        }
                    }
                }

                await _context.SelfAnswers.AddRangeAsync(newAnswers);
                await _context.SaveChangesAsync();
                
                await transaction.CommitAsync();

                return Ok(new { Message = "Lưu đánh giá thành công" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }
        
        // GET: api/Evaluations/student/{studentId}/semester/{semesterId}
        [HttpGet("student/{studentId}/semester/{semesterId}")]
        [Permission("EVAL_HISTORY_VIEW")]
        public async Task<IActionResult> GetEvaluation(string studentId, int semesterId)
        {
             var answers = await _context.SelfAnswers
                .Where(x => x.StudentId == studentId && x.SemesterId == semesterId)
                .ToListAsync();
             return Ok(answers);
        }

        // GET: api/Evaluations/history/{studentId}
        [HttpGet("history/{studentId}")]
        [Permission("EVAL_HISTORY_VIEW")]
        public async Task<IActionResult> GetHistory(string studentId)
        {
            var mssv = studentId;

            // Get all semesters first to map names
            var semesters = await _context.Semesters.ToListAsync();

            // Get all answers for this student
            var selfAnswers = await _context.SelfAnswers
                .Where(x => x.StudentId == mssv)
                .ToListAsync();

            if (!selfAnswers.Any())
                return Ok(new List<EvaluationHistoryDto>());

            // Get Answer definitions for scores
            var answerIds = selfAnswers.Select(x => x.AnswerId).Distinct().ToList();
            var answerDefs = await _context.AnswerLists
                .Where(x => answerIds.Contains(x.Id))
                .ToDictionaryAsync(x => x.Id, x => x.AnswerScore);

            // Group by Semester
            var history = selfAnswers
                .GroupBy(x => x.SemesterId)
                .Select(g => {
                    var sem = semesters.FirstOrDefault(s => s.Id == g.Key);
                    
                    // Calculate Total Score
                    int total = 0;
                    foreach (var ans in g)
                    {
                         if (answerDefs.TryGetValue(ans.AnswerId, out int score))
                         {
                             // Note: SelfAnswer stores duplicate rows for penalty count, 
                             // so summing them up works correctly for both positive (count=1) and negative (count=N).
                             total += score;
                         }
                    }

                    // Clamp -100 to 100
                    if (total > 100) total = 100;
                    if (total < -100) total = -100;

                    return new EvaluationHistoryDto
                    {
                        SemesterId = g.Key,
                        SemesterName = sem?.Name ?? "Unknown",
                        SchoolYear = sem?.SchoolYear ?? "",
                        TotalScore = total,
                        EvaluationDate = DateTime.Now // Placeholder as we don't track CreateDate in SelfAnswer yet
                    };
                })
                .OrderByDescending(x => x.SemesterId)
                .ToList();

            return Ok(history);
        }
    }
}
