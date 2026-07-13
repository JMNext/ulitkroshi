namespace UC.Domain.Models;

/// <summary>Внутреннее обновление статистики/игровых полей — вызывается только 
/// игровыми сервисами (MiniGameService, PetService и т.п.), не приходит от клиента напрямую</summary>
public class UpdatePlayerStatsDto
{
    public int? TotalExperience { get; set; }
    public int? Level { get; set; }
    public int? GamesPlayed { get; set; }
    public int? GamesWon { get; set; }
    public int? TotalFeedings { get; set; }
    public int? TotalWashings { get; set; }
    public int? TotalPlayings { get; set; }
    public int? TotalSleeps { get; set; }
    public DateTime? LastActiveAt { get; set; }
}
