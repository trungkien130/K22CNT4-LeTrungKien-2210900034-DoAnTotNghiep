using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("AccountLecturer")]
    public class AccountLecturer
    {
        [Key]
        public int Id { get; set; }

        public string UserName { get; set; }
        public string PasswordHash { get; set; }
        public bool IsActive { get; set; }

        public string LecturerId { get; set; }
        public int RoleId { get; set; }

        [ForeignKey("LecturerId")]
        public Lecturer Lecturer { get; set; }

        [ForeignKey("RoleId")]
        public Role Role { get; set; }
    }
}
