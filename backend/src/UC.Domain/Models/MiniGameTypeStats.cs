namespace UC.Domain.Models;

public class MiniGameTypeStats
{
    public int Played { get; set; }
    public int Won { get; set; }
    public int BestScore { get; set; }
    public long TotalScore { get; set; }
    public long TotalRewards { get; set; }
}
