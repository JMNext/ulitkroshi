using System.Threading.Channels;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using UC.Auth.Models;
using UC.Infrastructure.Database;
using UC.Infrastructure.Database.Entities.Identity;
using UC.Infrastructure.Database.Enum;

namespace UC.Auth.Services;

public class AuthService(UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IJwtTokenGenerator jwtGenerator,
        IUserSessionService sessionService,
        IDbContextFactory<UcDbContext> dbContextFactory,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthService> logger) : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly IUserSessionService _sessionService;
    private readonly IDbContextFactory<UcDbContext> _dbContextFactory;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, string? ipAddress = null, string? userAgent = null, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Email == request.EmailOrPhone || u.PhoneNumber == request.EmailOrPhone, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("Login failed: user not found - {Login}", request.EmailOrPhone);
            return null;
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Login failed: user inactive - {UserId}", user.Id);
            return null;
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            _logger.LogWarning("Login failed: invalid password - {UserId}", user.Id);
            return null;
        }

        var roles = await _userManager.GetRolesAsync(user);

        // Создаем сессию
        var refreshTokenRaw = _jwtGenerator.GenerateRefreshToken();
        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);

        var session = await _sessionService.CreateSessionAsync(
            user.Id, refreshTokenRaw, refreshTokenExpiresAt, ipAddress, userAgent, cancellationToken);

        // Генерируем токены с sessionId
        var accessToken = _jwtGenerator.GenerateAccessToken(user.Id, user.Email ?? string.Empty, roles, session.Id);
        var accessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);

        // Логируем активность
        await LogActivityAsync(user.Id, session.Id, ActivityType.Login, "login", null, ipAddress, userAgent);

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenRaw,
            AccessTokenExpiresAt = accessTokenExpiresAt,
            RefreshTokenExpiresAt = refreshTokenExpiresAt,
            User = MapToUserInfo(user, roles)
        };
    }

    public async Task LogoutAsync(Guid userId, Guid? sessionId = null, CancellationToken cancellationToken = default)
    {
        if (sessionId.HasValue)
        {
            await _sessionService.TerminateSessionAsync(sessionId.Value, userId, SessionTerminationReason.UserLogout, cancellationToken);
        }
        else
        {
            await _sessionService.TerminateAllUserSessionsAsync(userId, SessionTerminationReason.UserLogout, ct: cancellationToken);
        }

        await LogActivityAsync(userId, sessionId, ActivityType.Logout, "logout", null, null, null);

        _logger.LogInformation("User logged out: {UserId}, session: {SessionId}", userId, sessionId);
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var refreshTokenHash = Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(refreshToken)));

        await using var db = await _dbContextFactory.CreateDbContextAsync(cancellationToken);

        var session = await db.UserSessions
            .FirstOrDefaultAsync(s => s.RefreshTokenHash == refreshTokenHash && s.Status == SessionStatus.Active, cancellationToken);

        if (session == null)
        {
            _logger.LogWarning("Refresh token not found or session inactive");
            return null;
        }

        if (session.RefreshTokenExpiresAt < DateTime.UtcNow)
        {
            session.Status = SessionStatus.Expired;
            session.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);

            _logger.LogWarning("Refresh token expired for user: {UserId}", session.UserId);
            return null;
        }

        var user = await _userManager.FindByIdAsync(session.UserId.ToString());
        if (user == null || !user.IsActive)
        {
            _logger.LogWarning("User not found or inactive: {UserId}", session.UserId);
            return null;
        }

        var roles = await _userManager.GetRolesAsync(user);

        // Генерируем новый refresh token и обновляем сессию
        var newRefreshToken = _jwtGenerator.GenerateRefreshToken();
        var newRefreshTokenHash = Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(newRefreshToken)));
        var newRefreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);

        session.RefreshTokenHash = newRefreshTokenHash;
        session.RefreshTokenExpiresAt = newRefreshTokenExpiresAt;
        session.IpAddress = ipAddress ?? session.IpAddress;
        session.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtGenerator.GenerateAccessToken(user.Id, user.Email ?? string.Empty, roles, session.Id);
        var accessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);

        await LogActivityAsync(user.Id, session.Id, ActivityType.TokenRefresh, "token-refresh", null, ipAddress, null);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken,
            AccessTokenExpiresAt = accessTokenExpiresAt,
            RefreshTokenExpiresAt = newRefreshTokenExpiresAt,
            User = MapToUserInfo(user, roles)
        };
    }

    public async Task<UserInfo?> GetUserInfoAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return null;

        var roles = await _userManager.GetRolesAsync(user);
        return MapToUserInfo(user, roles);
    }

    private static UserInfo MapToUserInfo(ApplicationUser user, IList<string> roles)
    {
        return new UserInfo
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber,
            FullName = user.FullName,
            Roles = roles
        };
    }

    private async Task LogActivityAsync(Guid userId, Guid? sessionId, ActivityType type, string? action, string? resource, string? ipAddress, string? userAgent)
    {
        await _activityChannel.Writer.WriteAsync(new ActivityLogEntry(
            UserId: userId,
            SessionId: sessionId,
            ActivityType: type,
            Action: action,
            Path: resource,
            IpAddress: ipAddress,
            UserAgent: userAgent
        ));
    }
}
