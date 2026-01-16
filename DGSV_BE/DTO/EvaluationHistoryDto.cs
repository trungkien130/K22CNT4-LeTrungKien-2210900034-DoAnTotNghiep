namespace DGSV.Api.DTO
{
    public class EvaluationHistoryDto
    {
        public int SemesterId { get; set; }
        public string SemesterName { get; set; }
        public string SchoolYear { get; set; }
        public int TotalScore { get; set; }
        // public string Status { get; set; } // Could add approval status later
        public DateTime? EvaluationDate { get; set; }
    }
}
