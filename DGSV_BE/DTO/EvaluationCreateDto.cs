using System.ComponentModel.DataAnnotations;

namespace DGSV.Api.DTO
{
    public class EvaluationCreateDto
    {
        [Required]
        public int SemesterId { get; set; }
        
        [Required]
        public string StudentId { get; set; } // MSSV (string)

        public decimal TotalScore { get; set; }

        public List<EvaluationDetailDto> Details { get; set; }
    }

    public class EvaluationDetailDto
    {
        public int AnswerId { get; set; }
        public int Count { get; set; }
    }
}
