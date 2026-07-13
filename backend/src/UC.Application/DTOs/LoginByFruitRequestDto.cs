namespace UC.Application.DTOs;

public class LoginByFruitRequestDto
{
    public string PhoneNumber { get; set; } = null!;
    public List<string> FruitCode { get; set; } = new();
}
