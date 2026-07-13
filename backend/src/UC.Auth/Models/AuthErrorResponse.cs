namespace UC.Auth.Models;

/// <summary>
/// Ответ при ошибке авторизации
/// </summary>
public class AuthErrorResponse
{
    public bool Success { get; set; } = false;
    public string Message { get; set; } = string.Empty;
    public string? Code { get; set; }
}
