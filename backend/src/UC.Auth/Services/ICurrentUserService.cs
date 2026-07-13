using System.Security.Claims;

namespace UC.Auth.Services;

/// <summary>
/// Сервис для получения текущего пользователя из контекста
/// </summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? SessionId { get; }
    string? UserName { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    bool IsInRole(string role);
    IEnumerable<string> GetRoles();
    IEnumerable<Claim> GetClaims();
}