namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// Отслеживание использованных QR-кодов (с упаковки, бонусных, дружеских, промо) —
/// защита от повторного использования одного и того же кода несколькими игроками.
/// </summary>
public class UsedQrCode
{
    public Guid Id { get; set; }

    /// <summary>Уникальное значение/хэш самого QR-кода.</summary>
    public string Code { get; set; } = null!;

    public QrCodeType Type { get; set; }

    public Guid UsedByPlayerProfileId { get; set; }
    public PlayerProfile UsedByPlayerProfile { get; set; } = null!;

    public DateTime UsedAt { get; set; } = DateTime.UtcNow;
}
