namespace UC.Auth.Models;

/// <summary>
/// Ответ с токенами при успешной авторизации
/// </summary>
public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiresAt { get; set; }
    public DateTime RefreshTokenExpiresAt { get; set; }
    public UserInfo User { get; set; } = new();
}
