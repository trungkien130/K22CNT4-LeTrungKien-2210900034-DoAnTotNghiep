namespace DGSV.Api.DTO
{
    public class AnswerResponseDto
    {
        public int Id { get; set; }
        public string ContentAnswer { get; set; }
        public int QuestionId { get; set; }
        public int AnswerScore { get; set; }
        public bool Status { get; set; }
        public bool Checked { get; set; }
    }
}
