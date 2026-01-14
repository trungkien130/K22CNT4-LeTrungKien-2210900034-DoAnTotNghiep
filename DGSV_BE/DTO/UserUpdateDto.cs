namespace DGSV.Api.DTO
{
    public class UserUpdateDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool IsActive { get; set; }
        public int? ClassId { get; set; } // ✅ Allow updating class
        public DateTime? Birthday { get; set; }
        public bool? Gender { get; set; }
    }
}
