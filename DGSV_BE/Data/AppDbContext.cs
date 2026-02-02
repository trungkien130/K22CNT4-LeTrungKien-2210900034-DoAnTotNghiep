using DGSV.Api.Models;
using DGSV.Models;
using Microsoft.EntityFrameworkCore;

namespace DGSV.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Role> Roles { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Semester> Semesters { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<Lecturer> Lecturers { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<AccountStudent> AccountStudents { get; set; }
        public DbSet<AccountAdmin> AccountAdmins { get; set; }
        public DbSet<AccountLecturer> AccountLecturers { get; set; }
        public DbSet<TypeQuestion> TypeQuestions { get; set; }
        public DbSet<GroupQuestion> GroupQuestions { get; set; }
        public DbSet<QuestionList> QuestionLists { get; set; }
        public DbSet<AnswerList> AnswerLists { get; set; }
        public DbSet<SelfAnswer> SelfAnswers { get; set; }
        public DbSet<ClassAnswer> ClassAnswers { get; set; }
        public DbSet<SumaryOfPoint> SumaryOfPoints { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });
        }
    }
}