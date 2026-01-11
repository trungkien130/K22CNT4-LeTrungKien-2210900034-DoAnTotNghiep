using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("SumaryOfPoint")]
    public class SumaryOfPoint
    {
        [Key]
        public int Id { get; set; }
        public string StudentId { get; set; }
        public int SemesterId { get; set; }
        public int? SelfPoint { get; set; }
        public int? ClassPoint { get; set; }
        public int? LecturerPoint { get; set; }
        public string? Classify { get; set; }
    }
}
