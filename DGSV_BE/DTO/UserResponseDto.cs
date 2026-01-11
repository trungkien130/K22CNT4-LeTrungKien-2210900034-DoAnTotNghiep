namespace DGSV.Api.DTO
{
    public class UserResponseDto
    {
        public string Id { get; set; }       // ADMIN dùng int → convert string
        public string FullName { get; set; }
        public string UserName { get; set; }
        public string Role { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool IsActive { get; set; }
    }
}
