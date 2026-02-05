using DGSV.Api.Data;
using DGSV.Api.Models;
using DGSV.Api.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DGSV.Api.Controllers
{
    [Route("api/permission")]
    [ApiController]
    public class PermissionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PermissionController(AppDbContext context)
        {
            _context = context;
        }


        [HttpGet("roles")]
        [Permission("PERMISSION_MANAGE")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles.ToListAsync();
            return Ok(roles);
        }


        [HttpPost("create-role")]
        [Permission("PERMISSION_MANAGE")]
        public async Task<IActionResult> CreateRole([FromBody] DGSV.Api.DTO.RoleCreateDto dto)
        {
            Console.WriteLine($"[CREATE ROLE] Request received: {dto?.RoleName}");

            if (dto == null || string.IsNullOrWhiteSpace(dto.RoleName))
                return BadRequest("Tên vai trò không được để trống");

            if (await _context.Roles.AnyAsync(r => r.RoleName == dto.RoleName))
                return BadRequest("Vai trò đã tồn tại");

            var role = new Role
            {
                RoleName = dto.RoleName,
                IsActive = true
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return Ok(role);
        }


        [HttpGet]
        [Permission("PERMISSION_MANAGE")]
        public async Task<IActionResult> GetAll()
        {
            var permissions = await _context.Permissions.ToListAsync();
            return Ok(permissions);
        }


        [HttpGet("role/{roleId}")]
        [Permission("PERMISSION_MANAGE")]
        public async Task<IActionResult> GetByRole(int roleId)
        {
            var rolePermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Include(rp => rp.Permission)
                .Select(rp => rp.Permission)
                .ToListAsync();

            return Ok(rolePermissions);
        }

        [HttpPost("role/{roleId}")]
        [Permission("PERMISSION_MANAGE")]
        public async Task<IActionResult> AssignToRole(int roleId, [FromBody] List<int> permissionIds)
        {
            var roleExists = await _context.Roles.AnyAsync(r => r.Id == roleId);
            if (!roleExists) return NotFound("Role not found");



            var currentPerms = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .ToListAsync();



            var currentIds = currentPerms.Select(p => p.PermissionId).ToList();
            var toAdd = permissionIds.Except(currentIds).ToList();



            var toRemove = currentPerms.Where(p => !permissionIds.Contains(p.PermissionId)).ToList();

            if (toAdd.Any())
            {
                var newRolePermissions = toAdd.Select(pid => new RolePermission
                {
                    RoleId = roleId,
                    PermissionId = pid
                });
                _context.RolePermissions.AddRange(newRolePermissions);
            }

            if (toRemove.Any())
            {
                _context.RolePermissions.RemoveRange(toRemove);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Permissions synced successfully",
                AddedCount = toAdd.Count,
                RemovedCount = toRemove.Count
            });
        }
        

        [HttpDelete("role/{roleId}/{permissionId}")]
        [Permission("PERMISSION_MANAGE")]
        public async Task<IActionResult> RemoveFromRole(int roleId, int permissionId)
        {
            var rp = await _context.RolePermissions
                .FirstOrDefaultAsync(x => x.RoleId == roleId && x.PermissionId == permissionId);
            
            if (rp == null) return NotFound("Permission assignment not found");

            _context.RolePermissions.Remove(rp);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Permission revoked successfully" });
        }
    }
}
