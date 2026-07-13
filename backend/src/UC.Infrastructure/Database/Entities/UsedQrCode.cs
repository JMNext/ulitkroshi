using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using UC.Infrastructure.Database.Enum;

namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// Отслеживание использованных QR-кодов (с упаковки, бонусных, дружеских, промо) —
/// защита от повторного использования одного и того же кода несколькими игроками.
/// </summary>
[Table(name: "used_qr_code", Schema = "dbo")]
public class UsedQrCode
{
    [Key]
    public Guid Id { get; set; }

    /// <summary>Уникальное значение/хэш самого QR-кода.</summary>
    public string Code { get; set; } = null!;

    public QrCodeType Type { get; set; }

    public Guid UsedByPlayerProfileId { get; set; }
    public PlayerProfile UsedByPlayerProfile { get; set; } = null!;

    public DateTime UsedAt { get; set; } = DateTime.UtcNow;
}
