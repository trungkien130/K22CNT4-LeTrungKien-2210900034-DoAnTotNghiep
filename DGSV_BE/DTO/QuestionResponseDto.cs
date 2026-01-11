namespace DGSV.Api.DTOs
{
    public class QuestionResponseDto
    {
        public int Id { get; set; }
        public string ContentQuestion { get; set; }

        public int TypeQuestionId { get; set; }
        public string TypeQuestionName { get; set; }

        public int GroupQuestionId { get; set; }
        public string GroupQuestionName { get; set; }

        public int OrderBy { get; set; }
        public string UpdateBy { get; set; }
    }
}
