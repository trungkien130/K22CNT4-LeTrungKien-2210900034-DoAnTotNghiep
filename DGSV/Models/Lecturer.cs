using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("Lecturer")]
    public class Lecturer
    {
        [Key]
        public string Id { get; set; }
        public string FullName { get; set; }
        public int DepartmentId { get; set; }
        public string PositionId { get; set; }
        public DateTime? Birthday { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public bool IsActive { get; set; }

        [ForeignKey("DepartmentId")]
        public Department Department { get; set; }

        [ForeignKey("PositionId")]
        public Position Position { get; set; }
    }
}
