namespace UC.Application.DTOs;

public class PetTypeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Color { get; set; } = null!;
    public string Rarity { get; set; } = null!;
    public string BaseSpriteKey { get; set; } = null!;
}
