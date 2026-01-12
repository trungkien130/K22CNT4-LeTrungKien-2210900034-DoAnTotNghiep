namespace DGSV.Api.DTOs
{
    public class AccountResponseDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        public bool IsActive { get; set; }
        public string Role { get; set; }
    }
}
