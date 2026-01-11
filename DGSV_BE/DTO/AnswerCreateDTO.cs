namespace DGSV.Api.DTO
{
    public class AnswerCreateDto
    {
        public string ContentAnswer { get; set; }
        public int QuestionId { get; set; }
        public int AnswerScore { get; set; }
        public string UpdateBy { get; set; }
        public bool Checked { get; set; }
    }
}
