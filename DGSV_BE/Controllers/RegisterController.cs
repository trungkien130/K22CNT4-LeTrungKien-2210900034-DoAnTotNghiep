using DGSV.Api.Data;
using DGSV.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;

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
        public IActionResult ImportFromExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không hợp lệ");

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var stream = new MemoryStream();
            file.CopyTo(stream);

            using var package = new ExcelPackage(stream);
            var ws = package.Workbook.Worksheets[0];
            int rows = ws.Dimension.Rows;

            int success = 0;
            int fail = 0;

            using var transaction = _context.Database.BeginTransaction();
            try
            {
                for (int r = 2; r <= rows; r++)
                {
                    try
                    {
                        string fullName = ws.Cells[r, 1].Text.Trim();
                        string userName = ws.Cells[r, 2].Text.Trim();
                        string password = ws.Cells[r, 3].Text.Trim();
                        string role = ws.Cells[r, 4].Text.Trim().ToUpper();
                        string id = ws.Cells[r, 5].Text.Trim();
                        string email = ws.Cells[r, 7].Text.Trim();
                        string phone = ws.Cells[r, 8].Text.Trim();
                        string genderText = ws.Cells[r, 9].Text.Trim();
                        string positionText = ws.Cells[r, 10].Text.Trim();

                        if (string.IsNullOrWhiteSpace(userName) ||
                            string.IsNullOrWhiteSpace(password) ||
                            string.IsNullOrWhiteSpace(id))
                        {
                            fail++;
                            continue;
                        }

                        // ===== PARSE DATE (CHUẨN EXCEL) =====
                        DateTime birthday;
                        if (ws.Cells[r, 6].Value is DateTime dt)
                        {
                            birthday = dt;
                        }
                        else
                        {
                            var birthdayText = ws.Cells[r, 6].Text.Trim();
                            string[] formats = { "d/M/yyyy", "dd/MM/yyyy", "M/d/yyyy", "MM/dd/yyyy" };

                            if (!DateTime.TryParseExact(
                                birthdayText,
                                formats,
                                CultureInfo.InvariantCulture,
                                DateTimeStyles.None,
                                out birthday))
                            {
                                fail++;
                                continue;
                            }
                        }

                        // ===== PARSE GENDER =====
                        bool? gender = null;
                        if (!string.IsNullOrWhiteSpace(genderText))
                        {
                            var g = genderText.ToLower();
                            if (g == "nam" || g == "male" || g == "m") gender = true;
                            else if (g == "nữ" || g == "nu" || g == "female" || g == "f") gender = false;
                        }

                        // ===== CHECK USERNAME CHUNG =====
                        bool usernameExists =
                            _context.AccountAdmins.Any(x => x.UserName == userName) ||
                            _context.AccountLecturers.Any(x => x.UserName == userName) ||
                            _context.AccountStudents.Any(x => x.UserName == userName);

                        if (usernameExists)
                        {
                            fail++;
                            continue;
                        }

                        string passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

                        // ================= ADMIN =================
                        if (role == "ADMIN")
                        {
                            _context.AccountAdmins.Add(new AccountAdmin
                            {
                                FullName = fullName,
                                UserName = userName,
                                PasswordHash = passwordHash,
                                RoleId = 1,
                                IsActive = true
                            });
                        }

                        // ================= LECTURER =================
                        else if (role == "LECTURER")
                        {
                            if (_context.Lecturers.Any(x => x.Id == id))
                            {
                                fail++;
                                continue;
                            }

                            _context.Lecturers.Add(new Lecturer
                            {
                                Id = id,
                                FullName = fullName,
                                Birthday = birthday,
                                Email = email,
                                Phone = phone,
                                PositionId = "GV",
                                DepartmentId = 1,
                                IsActive = true
                            });

                            _context.AccountLecturers.Add(new AccountLecturer
                            {
                                UserName = userName,
                                PasswordHash = passwordHash,
                                LecturerId = id,
                                RoleId = 2,
                                IsActive = true
                            });
                        }

                        // ================= STUDENT =================
                        else if (role == "STUDENT")
                        {
                            if (_context.Students.Any(x => x.Id == id))
                            {
                                fail++;
                                continue;
                            }

                            _context.Students.Add(new Student
                            {
                                Id = id,
                                FullName = fullName,
                                Birthday = birthday,
                                Email = email,
                                Phone = phone,
                                Gender = gender,
                                PositionId = positionText == "Lớp Trưởng" ? "LT" : "SV",
                                ClassId = 1,
                                IsActive = true
                            });

                            _context.AccountStudents.Add(new AccountStudent
                            {
                                UserName = userName,
                                PasswordHash = passwordHash,
                                StudentId = id,
                                RoleId = 3,
                                IsActive = true
                            });
                        }
                        else
                        {
                            fail++;
                            continue;
                        }

                        _context.SaveChanges();
                        success++;
                    }
                    catch
                    {
                        fail++;
                    }
                }

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                return StatusCode(500, "Lỗi import Excel");
            }

            return Ok(new
            {
                Inserted = success,
                Failed = fail
            });
        }

        // =========================================================
        // 2️⃣ ADD ACCOUNT MANUALLY (JSON)
        // =========================================================
        [HttpPost("register")]
        public IActionResult RegisterManual([FromBody] RegisterRequest req)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            bool usernameExists =
                _context.AccountAdmins.Any(x => x.UserName == req.UserName) ||
                _context.AccountLecturers.Any(x => x.UserName == req.UserName) ||
                _context.AccountStudents.Any(x => x.UserName == req.UserName);

            if (usernameExists)
                return BadRequest("Username đã tồn tại");

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
                        ClassId = 1,
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

    // =========================================================
    // DTO REGISTER MANUAL
    // =========================================================
    public class RegisterRequest
    {
        public string FullName { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } // ADMIN | LECTURER | STUDENT

        public string Id { get; set; }
        public DateTime Birthday { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public bool? Gender { get; set; }
        public string? Position { get; set; }
    }
}
