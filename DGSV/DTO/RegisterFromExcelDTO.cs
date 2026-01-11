namespace DGSV.Api.Models
{
    public class RegisterRequest
    {
        public string FullName { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }

        // ADMIN | LECTURER | STUDENT
        public string Role { get; set; }
    }
}
