namespace UC.Infrastructure.Database.Enum;

/// <summary>
/// Статус сессии пользователя
/// </summary>
public enum SessionStatus
{
    /// <summary>
    /// Активна
    /// </summary>
    Active = 1,

    /// <summary>
    /// Завершена
    /// </summary>
    Terminated = 2,

    /// <summary>
    /// Истекла (по времени жизни refresh token)
    /// </summary>
    Expired = 3
}
