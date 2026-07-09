namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// Результат одного прохождения мини-игры ("Сбор урожая", "Змейка", "Мемори").
/// </summary>
public class MiniGameResult
{
    public Guid Id { get; set; }

    public Guid PlayerProfileId { get; set; }
    public PlayerProfile PlayerProfile { get; set; } = null!;

    public MiniGameType GameType { get; set; }

    public int Score { get; set; }

    public bool IsWin { get; set; }

    public long RewardCoins { get; set; }

    public int RewardExp { get; set; }

    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
}
