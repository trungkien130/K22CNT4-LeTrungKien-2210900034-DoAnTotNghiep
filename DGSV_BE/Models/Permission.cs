using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("Permission")]
    public class Permission
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string PermissionCode { get; set; }

        [Required]
        [StringLength(100)]
        public string PermissionName { get; set; }

        [StringLength(50)]
        public string Module { get; set; }
    }
}
