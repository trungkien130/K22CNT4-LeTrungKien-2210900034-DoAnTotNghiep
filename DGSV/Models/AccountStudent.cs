using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("AccountStudent")]
    public class AccountStudent
    {
        [Key]
        public int Id { get; set; }

        public string UserName { get; set; }
        public string PasswordHash { get; set; }
        public bool IsActive { get; set; }

        public string StudentId { get; set; }
        public int RoleId { get; set; }

        [ForeignKey("StudentId")]
        public Student Student { get; set; }

        [ForeignKey("RoleId")]
        public Role Role { get; set; }
    }
}
