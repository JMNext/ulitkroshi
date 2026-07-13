namespace UC.Application.DTOs;

public class AuthResponseDto
{
    public bool Success { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? AccessTokenExpiresAt { get; set; }
    public PlayerProfileDto? Profile { get; set; }
    public string? Message { get; set; }
}
