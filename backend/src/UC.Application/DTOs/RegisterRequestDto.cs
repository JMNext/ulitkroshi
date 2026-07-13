namespace UC.Application.DTOs;

public class RegisterRequestDto
{
    public string PhoneNumber { get; set; } = null!;
    public string Nickname { get; set; } = null!;
    public List<string> FruitCode { get; set; } = new();
}

