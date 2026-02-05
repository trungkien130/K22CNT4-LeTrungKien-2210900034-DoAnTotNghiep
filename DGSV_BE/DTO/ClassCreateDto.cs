using System.ComponentModel.DataAnnotations;

namespace DGSV.Api.DTO
{
    public class ClassCreateDto
    {
        [Required(ErrorMessage = "Tên lớp là bắt buộc")]
        public string Name { get; set; } = string.Empty;

        [StringLength(4, ErrorMessage = "Khóa tối đa 4 ký tự")]
        public string? CourseId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn khoa")]
        public int DepartmentId { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
