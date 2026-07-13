namespace UC.Application.DTOs;

public class PetDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public int StageNumber { get; set; }
    public int Experience { get; set; }
    public int Satiety { get; set; }
    public int Energy { get; set; }
    public int Cleanliness { get; set; }
    public int Happiness { get; set; }
    public bool IsSick { get; set; }
    public bool IsActive { get; set; }
    public PetTypeDto? PetType { get; set; }
}
