using System.ComponentModel.DataAnnotations;

namespace UC.Auth.Models;

/// <summary>
/// Запрос на обновление токена
/// </summary>
public class RefreshTokenRequest
{
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; } = string.Empty;
}
