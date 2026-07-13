using UC.Infrastructure.Database.Enum;

namespace UC.Domain.Models;

public class MiniGameStatistics
{
    public int TotalGames { get; set; }
    public int GamesWon { get; set; }
    public long TotalScore { get; set; }
    public long TotalRewards { get; set; }
    public Dictionary<MiniGameType, MiniGameTypeStats> ByGameType { get; set; } = new();
}
