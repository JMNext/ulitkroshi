using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UC.Infrastructure.Database;
using UC.Infrastructure.Database.Entities.Identity;
using UC.Infrastructure.Database.Enum;

namespace UC.Auth.Services;

public class UserSessionService : IUserSessionService
{
    private readonly IDbContextFactory<UcDbContext> _dbContextFactory;
    private readonly ILogger<UserSessionService> _logger;

    public UserSessionService(IDbContextFactory<UcDbContext> dbContextFactory, ILogger<UserSessionService> logger)
    {
        _dbContextFactory = dbContextFactory;
        _logger = logger;
    }

    public async Task<UserSession> CreateSessionAsync(Guid userId, string refreshToken, DateTime refreshTokenExpiresAt, string? ipAddress, string? userAgent, CancellationToken ct = default)
    {
        await using var db = await _dbContextFactory.CreateDbContextAsync(ct);

        var refreshTokenHash = Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(refreshToken)));

        var session = new UserSession
        {
            Id = Guid.CreateVersion7(),
            UserId = userId,
            SessionId = Guid.CreateVersion7().ToString(),
            RefreshTokenHash = refreshTokenHash,
            RefreshTokenExpiresAt = refreshTokenExpiresAt,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Status = SessionStatus.Active
        };

        db.UserSessions.Add(session);
        await db.SaveChangesAsync(ct);

        _logger.LogInformation("Session created: {SessionId} for user {UserId}", session.Id, userId);
        return session;
    }

    public async Task<UserSession?> GetSessionAsync(Guid sessionId, CancellationToken ct = default)
    {
        await using var db = await _dbContextFactory.CreateDbContextAsync(ct);

        return await db.UserSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId, ct);
    }

    public async Task<UserSession?> GetActiveSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default)
    {
        await using var db = await _dbContextFactory.CreateDbContextAsync(ct);

        return await db.UserSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId && s.Status == SessionStatus.Active, ct);
    }

    public async Task TerminateSessionAsync(Guid sessionId, Guid userId, SessionTerminationReason reason, CancellationToken ct = default)
    {
        await using var db = await _dbContextFactory.CreateDbContextAsync(ct);

        var session = await db.UserSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);

        if (session is not null)
        {
            session.Status = SessionStatus.Terminated;
            session.TerminationReason = reason;
            session.TerminatedAt = DateTime.UtcNow;
            session.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);

            _logger.LogInformation("Session {SessionId} terminated for user {UserId}, reason: {Reason}", sessionId, userId, reason);
        }
    }

    public async Task TerminateAllUserSessionsAsync(Guid userId, SessionTerminationReason reason, Guid? excludeSessionId = null, CancellationToken ct = default)
    {
        await using var db = await _dbContextFactory.CreateDbContextAsync(ct);

        var query = db.UserSessions.Where(s => s.UserId == userId && s.Status == SessionStatus.Active);

        if (excludeSessionId.HasValue)
            query = query.Where(s => s.Id != excludeSessionId.Value);

        var sessions = await query.ToListAsync(ct);

        foreach (var session in sessions)
        {
            session.Status = SessionStatus.Terminated;
            session.TerminationReason = reason;
            session.TerminatedAt = DateTime.UtcNow;
            session.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        _logger.LogInformation("All {Count} sessions terminated for user {UserId}, reason: {Reason}", sessions.Count, userId, reason);
    }

    public async Task<List<UserSession>> GetUserActiveSessionsAsync(Guid userId, CancellationToken ct = default)
    {
        await using var db = await _dbContextFactory.CreateDbContextAsync(ct);

        return await db.UserSessions
            .Where(s => s.UserId == userId && s.Status == SessionStatus.Active)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task ExpireSessionsByRefreshTokenAsync(string refreshTokenHash, CancellationToken ct = default)
    {
        await using var db = await _dbContextFactory.CreateDbContextAsync(ct);

        var sessions = await db.UserSessions
            .Where(s => s.RefreshTokenHash == refreshTokenHash && s.Status == SessionStatus.Active)
            .ToListAsync(ct);

        foreach (var session in sessions)
        {
            session.Status = SessionStatus.Expired;
            session.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
    }
}
