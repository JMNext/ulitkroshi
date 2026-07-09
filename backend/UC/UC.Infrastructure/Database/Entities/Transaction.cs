namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// История изменения баланса внутриигровой валюты игрока (журнал транзакций / event log для баланса).
/// </summary>
public class Transaction
{
    public Guid Id { get; set; }

    public Guid PlayerProfileId { get; set; }
    public PlayerProfile PlayerProfile { get; set; } = null!;

    /// <summary>Сумма изменения. Положительная — начисление, отрицательная — списание.</summary>
    public long Amount { get; set; }

    /// <summary>Баланс игрока сразу после применения этой транзакции (для аудита/восстановления).</summary>
    public long BalanceAfter { get; set; }

    public TransactionType Type { get; set; }

    /// <summary>Ссылка на источник операции: id мини-игры, покупки, награды и т.п.</summary>
    public string? SourceReference { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
