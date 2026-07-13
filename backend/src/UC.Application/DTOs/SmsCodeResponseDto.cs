namespace UC.Application.DTOs;

public class SmsCodeResponseDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public int? ExpiresInSeconds { get; set; }
}
