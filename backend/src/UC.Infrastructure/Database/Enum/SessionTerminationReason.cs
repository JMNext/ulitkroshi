namespace UC.Infrastructure.Database.Enum;

/// <summary>
/// Причина завершения сессии
/// </summary>
public enum SessionTerminationReason
{
    /// <summary>
    /// Явный выход (logout)
    /// </summary>
    UserLogout = 1,

    /// <summary>
    /// Завершена администратором
    /// </summary>
    AdminTerminated = 2,

    /// <summary>
    /// Истек refresh token
    /// </summary>
    RefreshTokenExpired = 3,

    /// <summary>
    /// Завершена из-за достижения лимита сессий
    /// </summary>
    SessionLimitReached = 4
}
