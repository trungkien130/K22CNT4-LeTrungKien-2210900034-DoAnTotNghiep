using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("RolePermission")]
    public class RolePermission
    {
        public int RoleId { get; set; }

        public int PermissionId { get; set; }

        // Navigation properties
        [ForeignKey("RoleId")]
        public Role Role { get; set; }

        [ForeignKey("PermissionId")]
        public Permission Permission { get; set; }
    }
}
