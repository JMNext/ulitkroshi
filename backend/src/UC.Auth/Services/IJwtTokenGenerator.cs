using System.Security.Claims;

namespace UC.Auth.Services;

/// <summary>
/// Генератор JWT токенов
/// </summary>
public interface IJwtTokenGenerator
{
    /// <summary>
    /// Генерация access token
    /// </summary>
    string GenerateAccessToken(Guid userId, string email, IEnumerable<string> roles, Guid? sessionId = null);

    /// <summary>
    /// Генерация refresh token
    /// </summary>
    string GenerateRefreshToken();

    /// <summary>
    /// Получение ClaimsPrincipal из истекшего токена
    /// </summary>
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);

    /// <summary>
    /// Валидация токена
    /// </summary>
    bool ValidateToken(string token);
}