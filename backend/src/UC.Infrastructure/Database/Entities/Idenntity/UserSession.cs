using System.ComponentModel.DataAnnotations;
using UC.Infrastructure.Database.Enum;

namespace UC.Infrastructure.Database.Entities.Identity;

/// <summary>
/// Сессия пользователя (устройство/браузер)
/// </summary>
public class UserSession
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public Guid UserId { get; set; }

    [MaxLength(100)]
    public string? SessionId { get; set; }

    [MaxLength(500)]
    public string? RefreshTokenHash { get; set; }

    public DateTime RefreshTokenExpiresAt { get; set; }

    [MaxLength(50)]
    public string? IpAddress { get; set; }

    [MaxLength(500)]
    public string? UserAgent { get; set; }

    public SessionStatus Status { get; set; } = SessionStatus.Active;

    public SessionTerminationReason? TerminationReason { get; set; }

    public DateTime? TerminatedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public virtual ApplicationUser User { get; set; } = null!;
}
