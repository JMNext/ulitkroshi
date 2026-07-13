namespace UC.Application.DTOs;

public class MiniGameResultDto
{
    public Guid Id { get; set; }
    public string GameType { get; set; } = null!;
    public int Score { get; set; }
    public bool IsWin { get; set; }
    public long RewardCoins { get; set; }
    public int RewardExp { get; set; }
    public DateTime PlayedAt { get; set; }
}
