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

            string defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");
            var errors = new List<string>();
            int successCount = 0;

            for (int row = 2; row <= rowCount; row++)
            {
                using var transaction = _context.Database.BeginTransaction();
                try
                {
                    // COLUMN MAPPING BASED ON SCREENSHOT:
                    // 1: FullName, 2: UserName, 3: Password, 4: Role, 5: ID
                    // 6: Birthday, 7: Email, 8: Phone, 9: Gender, 10: Position

                    var fullName = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                    var userName = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                    var passwordRaw = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                    var role = worksheet.Cells[row, 4].Value?.ToString()?.Trim()?.ToUpper();
                    var id = worksheet.Cells[row, 5].Value?.ToString()?.Trim();
                    var birthdayStr = worksheet.Cells[row, 6].Value?.ToString()?.Trim();
                    var email = worksheet.Cells[row, 7].Value?.ToString()?.Trim();
                    var phone = worksheet.Cells[row, 8].Value?.ToString()?.Trim();
                    var genderStr = worksheet.Cells[row, 9].Value?.ToString()?.Trim();
                    var positionStr = worksheet.Cells[row, 10].Value?.ToString()?.Trim();

                    // Validate required fields
                    if (string.IsNullOrEmpty(fullName) || string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(role))
                    {
                        errors.Add($"Dòng {row}: Thiếu thông tin bắt buộc (Họ tên, Username, Role)");
                        continue;
                    }

                    // Check duplicate Username globally across all account types
                    bool usernameExists = _context.AccountStudents.Any(a => a.UserName == userName) ||
                                          _context.AccountLecturers.Any(a => a.UserName == userName) ||
                                          _context.AccountAdmins.Any(a => a.UserName == userName);
                    
                    if (usernameExists)
                    {
                        errors.Add($"Dòng {row}: UserName {userName} đã tồn tại.");
                        continue;
                    }

                    // Parse Birthday
                    DateTime birthday = DateTime.Now;
                    string[] formats = { "d/M/yyyy", "dd/MM/yyyy", "M/d/yyyy", "yyyy-MM-dd", "dd-MM-yyyy" };
                    if (DateTime.TryParseExact(birthdayStr, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var d)) 
                        birthday = d;
                    else if (DateTime.TryParse(birthdayStr, out var d2))
                        birthday = d2;

                    // Parse Gender
                    bool? gender = null;
                    if (!string.IsNullOrEmpty(genderStr))
                    {
                        if (genderStr.Equals("Nam", StringComparison.OrdinalIgnoreCase)) gender = true;
                        if (genderStr.Equals("Nữ", StringComparison.OrdinalIgnoreCase)) gender = false;
                    }

                    // Password
                    string passwordHash = string.IsNullOrEmpty(passwordRaw) ? defaultPasswordHash : BCrypt.Net.BCrypt.HashPassword(passwordRaw);

                    // Process based on role
                    switch (role)
                    {
                        case "STUDENT":
                            if (string.IsNullOrEmpty(id)) 
                            { 
                                errors.Add($"Dòng {row}: Thiếu ID sinh viên."); 
                                continue; 
                            }
                            if (_context.Students.Any(s => s.Id == id))
                            {
                                errors.Add($"Dòng {row}: Mã SV {id} đã tồn tại.");
                                continue;
                            }

                            string positionId = "SV";
                            if (!string.IsNullOrEmpty(positionStr) && (positionStr.Contains("Lớp Trưởng", StringComparison.OrdinalIgnoreCase) || positionStr.Contains("LT", StringComparison.OrdinalIgnoreCase)))
                                positionId = "LT";

                            var student = new Student
                            {
                                Id = id,
                                FullName = fullName,
                                Birthday = birthday,
                                ClassId = 1, // Default
                                Phone = phone,
                                Email = email,
                                Gender = gender,
                                PositionId = positionId,
                                IsActive = true
                            };
                            _context.Students.Add(student);

                            var accStudent = new AccountStudent
                            {
                                UserName = userName,
                                PasswordHash = passwordHash,
                                StudentId = id,
                                RoleId = 3,
                                IsActive = true
                            };
                            _context.AccountStudents.Add(accStudent);
                            break;

                        case "LECTURER":
                            if (string.IsNullOrEmpty(id)) 
                            { 
                                errors.Add($"Dòng {row}: Thiếu ID giảng viên."); 
                                continue; 
                            }
                            if (_context.Lecturers.Any(l => l.Id == id))
                            {
                                errors.Add($"Dòng {row}: Mã GV {id} đã tồn tại.");
                                continue;
                            }

                            var lecturer = new Lecturer
                            {
                                Id = id,
                                FullName = fullName,
                                Birthday = birthday,
                                Email = email,
                                Phone = phone,
                                DepartmentId = 1, // Default Department
                                PositionId = "GV",
                                IsActive = true
                            };
                            _context.Lecturers.Add(lecturer);

                            var accLecturer = new AccountLecturer
                            {
                                UserName = userName,
                                PasswordHash = passwordHash,
                                LecturerId = id,
                                RoleId = 2,
                                IsActive = true
                            };
                            _context.AccountLecturers.Add(accLecturer);
                            break;

                        case "ADMIN":
                            // Admin usually doesn't need an ID in separate table, just in AccountAdmin
                            var accAdmin = new AccountAdmin
                            {
                                FullName = fullName,
                                UserName = userName,
                                PasswordHash = passwordHash,
                                RoleId = 1,
                                IsActive = true
                            };
                            _context.AccountAdmins.Add(accAdmin);
                            break;

                        default:
                            errors.Add($"Dòng {row}: Role '{role}' không hợp lệ.");
                            continue;
                    }

                    _context.SaveChanges();
                    transaction.Commit();
                    successCount++;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    errors.Add($"Dòng {row}: Lỗi - {ex.InnerException?.Message ?? ex.Message}");
                }
            }

            return Ok(new
            {
                Message = $"Import hoàn tất. Thành công: {successCount}, Lỗi: {errors.Count}",
                Errors = errors
            });
        }

        
        // ...
        
        // ...

        // =========================================================
        // 2️⃣ ADD ACCOUNT MANUALLY (JSON)
        // =========================================================
        [HttpPost("register")]
        [Permission("USER_MANAGE")]
        public async Task<IActionResult> RegisterManual([FromBody] RegisterRequestDto req)
        {




            var roleUpper = req.Role.ToUpper();
            if ((roleUpper == "STUDENT" || roleUpper == "LECTURER") && string.IsNullOrWhiteSpace(req.Id))
            {
                return BadRequest("Mã số (ID) là bắt buộc cho Sinh viên và Giảng viên");
            }
            bool usernameExists =
                await _context.AccountAdmins.AnyAsync(x => x.UserName == req.UserName) ||
                await _context.AccountLecturers.AnyAsync(x => x.UserName == req.UserName) ||
                await _context.AccountStudents.AnyAsync(x => x.UserName == req.UserName);

            if (usernameExists)
            {
                return BadRequest($"Tên đăng nhập {req.UserName} đã tồn tại trong hệ thống");
            }

            if (roleUpper == "STUDENT")
            {
                if (await _context.Students.AnyAsync(s => s.Id == req.Id))
                    return BadRequest($"Mã sinh viên {req.Id} đã tồn tại. Vui lòng kiểm tra lại (Người dùng này có thể đang ở trạng thái ngưng hoạt động).");
            }
            else if (roleUpper == "LECTURER")
            {
                if (await _context.Lecturers.AnyAsync(l => l.Id == req.Id))
                    return BadRequest($"Mã giảng viên {req.Id} đã tồn tại. Vui lòng kiểm tra lại (Người dùng này có thể đang ở trạng thái ngưng hoạt động).");
            }



            if (await _context.Students.AnyAsync(s => s.Email == req.Email) || 
                await _context.Lecturers.AnyAsync(l => l.Email == req.Email))
            {
                return BadRequest($"Email {req.Email} đã được sử dụng bởi người dùng khác");
            }

            if (!string.IsNullOrEmpty(req.Phone) && 
               (await _context.Students.AnyAsync(s => s.Phone == req.Phone) || 
                await _context.Lecturers.AnyAsync(l => l.Phone == req.Phone)))
            {
                return BadRequest($"Số điện thoại {req.Phone} đã được sử dụng bởi người dùng khác");
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);

            using var transaction = await _context.Database.BeginTransactionAsync();
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
                        ClassId = req.ClassId ?? 1,
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

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
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
