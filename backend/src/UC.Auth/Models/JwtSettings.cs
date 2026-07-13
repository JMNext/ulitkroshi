namespace UC.Auth.Models;

/// <summary>
/// Настройки JWT токенов
/// </summary>
public class JwtSettings
{
    /// <summary>
    /// Секретный ключ для подписи токенов (минимум 32 символа)
    /// </summary>
    public string Secret { get; set; } = string.Empty;

    /// <summary>
    /// Время жизни Access Token в минутах
    /// </summary>
    public int AccessTokenExpirationMinutes { get; set; } = 15;

    /// <summary>
    /// Время жизни Refresh Token в днях
    /// </summary>
    public int RefreshTokenExpirationDays { get; set; } = 7;

    /// <summary>
    /// Издатель токена
    /// </summary>
    public string Issuer { get; set; } = string.Empty;

    /// <summary>
    /// Аудитория токена
    /// </summary>
    public string Audience { get; set; } = string.Empty;
}
