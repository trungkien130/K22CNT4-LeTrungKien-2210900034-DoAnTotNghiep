using DGSV.Api.Data;
using DGSV.Api.Models;
using DGSV.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;
using DGSV.Api.Filters;

namespace DGSV.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // 1️⃣ IMPORT ACCOUNT FROM EXCEL
        // =========================================================
        [HttpPost("import-excel")]
        [Permission("USER_MANAGE")]
        public async Task<IActionResult> ImportFromExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không hợp lệ");

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);

            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets[0];
            var rowCount = worksheet.Dimension.Rows;

            int successCount = 0;
            var errors = new List<string>();

            // Default hardcoded password for imported users
            string defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");

            for (int row = 2; row <= rowCount; row++)
            {
                try
                {
                    // Assume columns: A=MSSV, B=HoTen, C=NgaySinh, D=Lop, E=SDT, F=Email
                    var mssv = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                    var fullName = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                    var birthdayStr = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                    var className = worksheet.Cells[row, 4].Value?.ToString()?.Trim();
                    
                    if (string.IsNullOrEmpty(mssv) || string.IsNullOrEmpty(fullName)) continue;

                    if (await _context.Students.AnyAsync(s => s.Id == mssv))
                    {
                        errors.Add($"Dòng {row}: MSSV {mssv} đã tồn tại");
                        continue;
                    }

                    // Parse Birthday
                    DateTime birthday = DateTime.Now;
                    if (DateTime.TryParse(birthdayStr, out var d)) birthday = d;
                    else if (DateTime.TryParseExact(birthdayStr, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d2)) birthday = d2;

                    // Find or Create Class
                    int classId = 1; // Default
                    if (!string.IsNullOrEmpty(className))
                    {
                        var cls = await _context.Classes.FirstOrDefaultAsync(c => c.Name == className);
                        if (cls == null)
                        {
                            cls = new Class { Name = className, DepartmentId = 1 }; // Default Dept
                            _context.Classes.Add(cls);
                            await _context.SaveChangesAsync();
                        }
                        classId = cls.Id;
                    }

                    // Create Student
                    var student = new Student
                    {
                        Id = mssv,
                        FullName = fullName,
                        Birthday = birthday,
                        ClassId = classId,
                        Gender = null, // Fixed: bool? cannot take string "Khác"
                        PositionId = "SV",
                        IsActive = true
                    };
                    _context.Students.Add(student);

                    // Create Account
                    var account = new AccountStudent
                    {
                        UserName = mssv, // Username = MSSV
                        PasswordHash = defaultPasswordHash,
                        StudentId = mssv,
                        RoleId = 3, // STUDENT
                        IsActive = true
                    };
                    _context.AccountStudents.Add(account);
                    
                    successCount++;
                }
                catch (Exception ex)
                {
                    errors.Add($"Dòng {row}: Lỗi - {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"Import hoàn tất. Thành công: {successCount}, Lỗi: {errors.Count}",
                Errors = errors
            });
        }
        
        // ...

        // =========================================================
        // 2️⃣ ADD ACCOUNT MANUALLY (JSON)
        // =========================================================
        [HttpPost("register")]
        [Permission("USER_MANAGE")]
        public IActionResult RegisterManual([FromBody] RegisterRequestDto req)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // ✅ Manual Validation for ID
            var roleUpper = req.Role.ToUpper();
            if ((roleUpper == "STUDENT" || roleUpper == "LECTURER") && string.IsNullOrWhiteSpace(req.Id))
            {
                return BadRequest("Mã số (ID) là bắt buộc cho Sinh viên và Giảng viên");
            }

            bool usernameExists =
                _context.AccountAdmins.Any(x => x.UserName == req.UserName) ||
                _context.AccountLecturers.Any(x => x.UserName == req.UserName) ||
                _context.AccountStudents.Any(x => x.UserName == req.UserName);

            if (usernameExists)
                return BadRequest("Username đã tồn tại");

            // ✅ CHECK DUPLICATE ID (MSSV / MSGV)
            if (roleUpper == "STUDENT")
            {
                if (_context.Students.Any(s => s.Id == req.Id))
                    return BadRequest($"Mã sinh viên {req.Id} đã tồn tại");
            }
            else if (roleUpper == "LECTURER")
            {
                if (_context.Lecturers.Any(l => l.Id == req.Id))
                    return BadRequest($"Mã giảng viên {req.Id} đã tồn tại");
            }

            // ✅ CHECK DUPLICATE EMAIL / PHONE
            // Check in Students
            if (_context.Students.Any(s => s.Email == req.Email) || 
                _context.Lecturers.Any(l => l.Email == req.Email))
            {
                return BadRequest($"Email {req.Email} đã được sử dụng bởi người dùng khác");
            }

            if (!string.IsNullOrEmpty(req.Phone) && 
               (_context.Students.Any(s => s.Phone == req.Phone) || 
                _context.Lecturers.Any(l => l.Phone == req.Phone)))
            {
                // return BadRequest($"Số điện thoại {req.Phone} đã được sử dụng");
                // Optional: strictly enforce phone uniqueness? Maybe warn? 
                // User asked to "avoid duplicates", usually implies strict check.
                return BadRequest($"Số điện thoại {req.Phone} đã được sử dụng");
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);

            using var transaction = _context.Database.BeginTransaction();
            try
            {
                if (req.Role.ToUpper() == "ADMIN")
                {
                    _context.AccountAdmins.Add(new AccountAdmin
                    {
                        FullName = req.FullName,
                        UserName = req.UserName,
                        PasswordHash = passwordHash,
                        RoleId = 1,
                        IsActive = true
                    });
                }
                else if (req.Role.ToUpper() == "LECTURER")
                {
                    _context.Lecturers.Add(new Lecturer
                    {
                        Id = req.Id,
                        FullName = req.FullName,
                        Birthday = req.Birthday,
                        Email = req.Email,
                        Phone = req.Phone,
                        PositionId = "GV",
                        DepartmentId = 1,
                        IsActive = true
                    });

                    _context.AccountLecturers.Add(new AccountLecturer
                    {
                        UserName = req.UserName,
                        PasswordHash = passwordHash,
                        LecturerId = req.Id,
                        RoleId = 2,
                        IsActive = true
                    });
                }
                else if (req.Role.ToUpper() == "STUDENT")
                {
                    _context.Students.Add(new Student
                    {
                        Id = req.Id,
                        FullName = req.FullName,
                        Birthday = req.Birthday,
                        Email = req.Email,
                        Phone = req.Phone,
                        Gender = req.Gender,
                        PositionId = req.Position == "Lớp Trưởng" ? "LT" : "SV",
                        ClassId = req.ClassId ?? 1, // ✅ Use provided ClassId or default to 1
                        IsActive = true
                    });

                    _context.AccountStudents.Add(new AccountStudent
                    {
                        UserName = req.UserName,
                        PasswordHash = passwordHash,
                        StudentId = req.Id,
                        RoleId = 3,
                        IsActive = true
                    });
                }
                else
                {
                    return BadRequest("Role không hợp lệ");
                }

                _context.SaveChanges();
                transaction.Commit();
                return Ok("Tạo tài khoản thành công");
            }
            catch
            {
                transaction.Rollback();
                return StatusCode(500, "Lỗi tạo tài khoản");
            }
        }
    }
}
