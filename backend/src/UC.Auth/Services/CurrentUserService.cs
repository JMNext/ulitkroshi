using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace UC.Auth.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{

    public Guid? UserId
    {
        get
        {
            var userIdClaim = httpContextAccessor.HttpContext?.User?.FindFirst("sub")
                              ?? httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);

            return userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId) ? userId : null;
        }
    }

    public Guid? SessionId
    {
        get
        {
            var sidClaim = httpContextAccessor.HttpContext?.User?.FindFirst("sid");
            return sidClaim != null && Guid.TryParse(sidClaim.Value, out var sid) ? sid : null;
        }
    }

    public string? UserName => httpContextAccessor.HttpContext?.User?.Identity?.Name
                   ?? httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value;

    public string? Email => httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;

    public bool IsAuthenticated => httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public bool IsInRole(string role) => httpContextAccessor.HttpContext?.User?.IsInRole(role) ?? false;

    public IEnumerable<string> GetRoles() => httpContextAccessor.HttpContext?.User?.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value) ?? Enumerable.Empty<string>();

    public IEnumerable<Claim> GetClaims()
        => httpContextAccessor.HttpContext?.User?.Claims ?? Enumerable.Empty<Claim>();
}