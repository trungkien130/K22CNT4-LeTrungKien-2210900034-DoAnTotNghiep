using DGSV.Api.Data;
using DGSV.Api.DTO;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        public async Task<IActionResult> Create([FromBody] EvaluationCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // dto.StudentId is now MSSV (string)
            // Verify student exists? Optional but good.
            // var student = await _context.Students.FindAsync(dto.StudentId);
            // if (student == null) return NotFound("Sinh viên không tồn tại");

            var mssv = dto.StudentId;

            // 2. Remove existing evaluations for this Student + Semester
            var existing = await _context.SelfAnswers
                .Where(x => x.StudentId == mssv && x.SemesterId == dto.SemesterId)
                .ToListAsync();
            
            if (existing.Any())
            {
                _context.SelfAnswers.RemoveRange(existing);
            }

            // 3. Add new evaluations
            var newAnswers = new List<SelfAnswer>();
            foreach (var detail in dto.Details)
            {
                // Multiply by Count
                for (int i = 0; i < detail.Count; i++)
                {
                    newAnswers.Add(new SelfAnswer
                    {
                        StudentId = mssv,
                        AnswerId = detail.AnswerId,
                        SemesterId = dto.SemesterId
                    });
                }
            }

            await _context.SelfAnswers.AddRangeAsync(newAnswers);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Lưu đánh giá thành công" });
        }

        // GET: api/Evaluations/student/{studentId}/semester/{semesterId}
        [HttpGet("student/{studentId}/semester/{semesterId}")]
        public async Task<IActionResult> GetEvaluation(string studentId, int semesterId)
        {
            // studentId can be MSSV (string) directly if we change route or client usage
            // The previous version assumed AccountId. 
            // Let's support MSSV directly for simplicity in Frontend.
            
            var mssv = studentId;

            // 2. Get SelfAnswers
            var answers = await _context.SelfAnswers
                .Where(x => x.StudentId == mssv && x.SemesterId == semesterId)
                .ToListAsync();

            // Group by AnswerId to count
            var result = answers
                .GroupBy(x => x.AnswerId)
                .Select(g => new EvaluationDetailDto
                {
                    AnswerId = g.Key,
                    Count = g.Count()
                })
                .ToList();

            return Ok(result);
        }
        // GET: api/Evaluations/history/{studentId}
        [HttpGet("history/{studentId}")]
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
