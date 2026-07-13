using System.ComponentModel.DataAnnotations;

namespace UC.Auth.Models;

/// <summary>
/// Запрос на вход в систему
/// </summary>
public class LoginRequest
{
    [Required(ErrorMessage = "Email or phone is required")]
    public string EmailOrPhone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; } = false;
}
