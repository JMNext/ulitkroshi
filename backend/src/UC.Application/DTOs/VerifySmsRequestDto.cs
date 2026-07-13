namespace UC.Application.DTOs;

public class VerifySmsRequestDto
{
    public string PhoneNumber { get; set; } = null!;
    public string Code { get; set; } = null!;
}
