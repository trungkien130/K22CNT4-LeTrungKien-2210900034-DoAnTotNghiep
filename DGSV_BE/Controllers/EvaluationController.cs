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
                var oldAnswers = await _context.SelfAnswers
                    .Where(x => x.StudentId == dto.StudentId && x.SemesterId == dto.SemesterId)
                    .ToListAsync();
                
                if (oldAnswers.Any())
                {
                    _context.SelfAnswers.RemoveRange(oldAnswers);
                }

                var newAnswers = new List<SelfAnswer>();
                if (dto.Details != null)
                {
                    foreach (var d in dto.Details)
                    {
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
        public async Task<IActionResult> GetEvaluation(string studentId, int semesterId)
        {
            // Manual permission check: Allow EVAL_HISTORY_VIEW (students), EVAL_ADMIN_VIEW (admins), SUPPER_ADMIN role, or any ADMIN role
            var user = HttpContext.User;
            
            if (!user.Identity.IsAuthenticated)
            {
                return Unauthorized();
            }

            // Check if user is SUPPER_ADMIN or has ADMIN in role name (bypass permission checks)
            var roleNameClaim = user.Claims.FirstOrDefault(c => c.Type == "Role");
            bool isSuperAdmin = roleNameClaim != null && roleNameClaim.Value == "SUPPER_ADMIN";
            bool isAdmin = roleNameClaim != null && roleNameClaim.Value.ToUpper().Contains("ADMIN");

            if (!isSuperAdmin && !isAdmin)
            {
                // Get RoleId from Claims
                var roleIdClaim = user.Claims.FirstOrDefault(c => c.Type == "RoleId");
                if (roleIdClaim == null || !int.TryParse(roleIdClaim.Value, out int roleId))
                {
                    return Forbid();
                }

                // Check if user has either EVAL_HISTORY_VIEW or EVAL_ADMIN_VIEW permission
                var hasPermission = await _context.RolePermissions
                    .AnyAsync(rp => rp.RoleId == roleId && 
                        (rp.Permission.PermissionCode == "EVAL_HISTORY_VIEW" || 
                         rp.Permission.PermissionCode == "EVAL_ADMIN_VIEW"));

                if (!hasPermission)
                {
                    return Forbid();
                }
            }

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
                             total += score;
                         }
                    }

                    if (total > 100) total = 100;
                    if (total < -100) total = -100;

                    return new EvaluationHistoryDto
                    {
                        SemesterId = g.Key,
                        SemesterName = sem?.Name ?? "Unknown",
                        SchoolYear = sem?.SchoolYear ?? "",
                        TotalScore = total,
                        EvaluationDate = DateTime.Now
                    };
                })
                .OrderByDescending(x => x.SemesterId)
                .ToList();

            return Ok(history);
        }
    }
}
