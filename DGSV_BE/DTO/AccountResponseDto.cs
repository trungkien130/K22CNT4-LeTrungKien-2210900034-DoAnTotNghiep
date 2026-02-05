namespace DGSV.Api.DTOs
{
    public class AccountResponseDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        public bool IsActive { get; set; }
        public string Role { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public DateTime? Birthday { get; set; }
        public bool? Gender { get; set; }
        public string? ClassName { get; set; }
        public string? DepartmentName { get; set; }
        public string? Position { get; set; }
        public string? StudentId { get; set; }
        public string? PasswordHash { get; set; }
    }
}
