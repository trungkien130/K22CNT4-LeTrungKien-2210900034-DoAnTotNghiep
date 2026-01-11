using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("ClassAnswer")]
    public class ClassAnswer
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey("StudentId")]
        public string StudentId { get; set; }
        public string CreateBy { get; set; }
        public DateTime CreateDate { get; set; }
        [ForeignKey("AnswerId")]
        public int AnswerId { get; set; }
        [ForeignKey("SemesterId")]
        public int SemesterId { get; set; }

    }
}
