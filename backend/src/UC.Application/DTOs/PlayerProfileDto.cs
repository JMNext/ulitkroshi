namespace UC.Application.DTOs;

public class PlayerProfileDto
{
    public Guid Id { get; set; }
    public string Nickname { get; set; } = null!;
    public int AvatarIndex { get; set; }
    public long Balance { get; set; }
    public int Level { get; set; }
    public int TotalExperience { get; set; }
    public int GamesPlayed { get; set; }
    public int GamesWon { get; set; }
    public Guid? ActivePetId { get; set; }
    public PetDto? ActivePet { get; set; }
}

