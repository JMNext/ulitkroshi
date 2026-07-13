using UC.Auth.Models;

namespace UC.Auth.Services;

/// <summary>
/// Сервис аутентификации и управления пользователями
/// </summary>
public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request, string? ipAddress = null, string? userAgent = null, CancellationToken cancellationToken = default);
    Task LogoutAsync(Guid userId, Guid? sessionId = null, CancellationToken cancellationToken = default);
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<UserInfo?> GetUserInfoAsync(Guid userId, CancellationToken cancellationToken = default);
}
