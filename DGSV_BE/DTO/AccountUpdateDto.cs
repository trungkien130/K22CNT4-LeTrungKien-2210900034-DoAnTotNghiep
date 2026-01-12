public class AccountUpdateDto
{
    public string UserName { get; set; }
    public bool IsActive { get; set; }

    // chỉ admin dùng
    public string? FullName { get; set; }
}

