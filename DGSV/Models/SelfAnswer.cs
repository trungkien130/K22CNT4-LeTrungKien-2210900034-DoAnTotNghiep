using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("SelfAnswer")]
    public class SelfAnswer
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey("StudentId")]
        public string StudentId { get; set; }
        [ForeignKey("AnswerId")]
        public int AnswerId { get; set; }
        [ForeignKey("SemesterId")]
        public int SemesterId { get; set; }
    }
}
