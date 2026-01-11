namespace DGSV.Api.DTO
{
    public class UserCreateDto
    {
        public string Role { get; set; } // ADMIN | LECTURER | STUDENT
        public string Id { get; set; }   // Lecturer/Student
        public string UserName { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
    }
}
