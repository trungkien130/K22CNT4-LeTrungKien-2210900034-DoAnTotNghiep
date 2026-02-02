using System.ComponentModel.DataAnnotations;

namespace DGSV.Api.DTO
{
    public class FeedbackCreateDto
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public string StudentId { get; set; }
    }
}
