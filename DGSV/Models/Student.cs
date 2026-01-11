using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("Student")]
    public class Student
    {
        [Key]
        [Column(TypeName = "char(10)")]
        public string Id { get; set; }

        public string FullName { get; set; }
        public DateTime? Birthday { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool? Gender { get; set; }

        public int ClassId { get; set; }
        public Class Class { get; set; }

        [Column(TypeName = "char(3)")]
        public string PositionId { get; set; }   // ✅ string

        [ForeignKey("PositionId")]
        public Position Position { get; set; }

        public bool IsActive { get; set; }
    }
}
