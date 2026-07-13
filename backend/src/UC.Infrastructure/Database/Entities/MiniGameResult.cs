using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using UC.Infrastructure.Database.Enum;

namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// Результат одного прохождения мини-игры ("Сбор урожая", "Змейка", "Мемори").
/// </summary>
[Table(name: "mini_game_result", Schema = "dbo")]
public class MiniGameResult
{
    [Key]
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
