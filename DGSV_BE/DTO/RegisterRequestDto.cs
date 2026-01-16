namespace DGSV.DTO
{
    public class RegisterRequestDto
    {
        public string FullName { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } // ADMIN | LECTURER | STUDENT
        public string? ClassName { get; set; } // ✅ Allow nullable
        public string? Id { get; set; } // ✅ Allow nullable (for Admin)
        public DateTime? Birthday { get; set; } // ✅ Nullable to avoid validation error
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public bool? Gender { get; set; }
        public string? Position { get; set; }
        public int? ClassId { get; set; } // ✅ Add ClassId
    }
}
