using System.ComponentModel.DataAnnotations;

namespace DGSV.Api.DTOs
{
    public class QuestionCreateDto
    {
        [Required]
        public string ContentQuestion { get; set; }

        [Required]
        public int TypeQuestionId { get; set; }

        [Required]
        public int GroupQuestionId { get; set; }

        public int OrderBy { get; set; }
        public string UpdateBy { get; set; }
    }
}
