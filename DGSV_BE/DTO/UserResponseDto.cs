namespace DGSV.Api.DTO
{
    public class UserResponseDto
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }

        public string? Email { get; set; }
        public string? Phone { get; set; }
        public int? ClassId { get; set; }
        public string? ClassName { get; set; }
        
        // ✅ Extended fields
        public DateTime? Birthday { get; set; }
        public bool? Gender { get; set; }
        public string? DepartmentName { get; set; }
        public string? Position { get; set; }

        public bool IsActive { get; set; }
    }
}
