namespace UC.Application.DTOs;

public class ItemDefinitionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Category { get; set; } = null!;
    public long Price { get; set; }
    public string? Description { get; set; }
    public string IconKey { get; set; } = null!;
}
