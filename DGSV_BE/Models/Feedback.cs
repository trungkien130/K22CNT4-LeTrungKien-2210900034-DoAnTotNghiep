using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    public class Feedback
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        [Column(TypeName = "char(10)")]
        public string? StudentId { get; set; }

        public string Status { get; set; } = "Pending"; // Pending, Reviewed

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("StudentId")]
        public virtual Student? Student { get; set; }
    }
}
