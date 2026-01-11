using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("Course")]
    public class Course
    {
        [Key]
        [Column(TypeName = "char(4)")]
        public string Id { get; set; }

        public string Name { get; set; }

        public ICollection<Class> Classes { get; set; }
    }
}
