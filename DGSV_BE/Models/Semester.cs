using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("Semester")]
    public class Semester
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string SchoolYear { get; set; }
        public DateTime? DateOpenStudent { get; set; }
        public DateTime? DateEndStudent { get; set; }
        public DateTime? DateEndClass { get; set; }
        public DateTime? DateEndLecturer { get; set; }
        public bool IsActive { get; set; }
    }
}
