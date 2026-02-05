using DGSV.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DGSV.Api.Filters
{
    public class PermissionAttribute : TypeFilterAttribute
    {
        public PermissionAttribute(string permissionCode) : base(typeof(PermissionFilter))
        {
            Arguments = new object[] { permissionCode };
        }
    }

    public class PermissionFilter : IAsyncAuthorizationFilter
    {
        private readonly string _permissionCode;
        private readonly AppDbContext _context;

        public PermissionFilter(string permissionCode, AppDbContext context)
        {
            _permissionCode = permissionCode;
            _context = context;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            if (!user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Get RoleId from Claims
            var roleIdClaim = user.Claims.FirstOrDefault(c => c.Type == "RoleId");
            if (roleIdClaim == null || !int.TryParse(roleIdClaim.Value, out int roleId))
            {
                context.Result = new ForbidResult();
                return;
            }

            // Verify Permission in DB
            // Optimization: Could cache this in MemoryCache or Redis
            
            // 🔹 SUPER ADMIN BYPASS (ROLE BASED)
            // Check if user has "SUPER_ADMIN" role (claim "Role")
            var roleNameClaim = user.Claims.FirstOrDefault(c => c.Type == "Role");
            if (roleNameClaim != null && roleNameClaim.Value == "SUPER_ADMIN")
            {
                return; // Access Granted
            }

            var hasPermission = await _context.RolePermissions
                .AnyAsync(rp => rp.RoleId == roleId && rp.Permission.PermissionCode == _permissionCode);

            if (!hasPermission)
            {
                // DEBUG LOGGING
                Console.Error.WriteLine($"[RBAC FAILS] User '{user.Identity.Name}' (RoleID: {roleId}) tried to access '{_permissionCode}'. Permission Denied.");
                
                // Also print what permissions this role DOES have (optional, but helpful)
                var existingPerms = await _context.RolePermissions
                     .Where(rp => rp.RoleId == roleId)
                     .Select(rp => rp.Permission.PermissionCode)
                     .ToListAsync();
                Console.Error.WriteLine($"[RBAC INFO] Role {roleId} has: {string.Join(", ", existingPerms)}");

                context.Result = new ForbidResult();
            }
        }
    }
}
