using UC.Infrastructure.Database.Entities.Identity;
using UC.Infrastructure.Database.Enum;

namespace UC.Auth.Services;

/// <summary>
/// Сервис управления сессиями пользователей
/// </summary>
public interface IUserSessionService
{
    Task<UserSession> CreateSessionAsync(Guid userId, string refreshToken, DateTime refreshTokenExpiresAt, string? ipAddress, string? userAgent, CancellationToken ct = default);

    Task<UserSession?> GetActiveSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default);

    Task<UserSession?> GetSessionAsync(Guid sessionId, CancellationToken ct = default);

    Task TerminateSessionAsync(Guid sessionId, Guid userId, SessionTerminationReason reason, CancellationToken ct = default);

    Task TerminateAllUserSessionsAsync(Guid userId, SessionTerminationReason reason, Guid? excludeSessionId = null, CancellationToken ct = default);

    Task<List<UserSession>> GetUserActiveSessionsAsync(Guid userId, CancellationToken ct = default);

    Task ExpireSessionsByRefreshTokenAsync(string refreshTokenHash, CancellationToken ct = default);
}
