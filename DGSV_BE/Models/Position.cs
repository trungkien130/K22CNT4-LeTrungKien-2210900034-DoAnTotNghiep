using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("Position")]
    public class Position
    {
        [Key]
        [Column(TypeName = "char(3)")]
        public string Id { get; set; }   // ✅ string

        public string Name { get; set; }

        public ICollection<Student> Students { get; set; }
        public ICollection<Lecturer> Lecturers { get; set; }
    }
}
