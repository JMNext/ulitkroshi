namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// Дружеская связь между двумя игроками (добавление по QR-коду). Направленная запись:
/// PlayerProfileId — инициатор, FriendProfileId — приглашённый.
/// </summary>
public class Friend
{
    public Guid Id { get; set; }

    public Guid PlayerProfileId { get; set; }
    public PlayerProfile PlayerProfile { get; set; } = null!;

    public Guid FriendProfileId { get; set; }
    public PlayerProfile FriendProfile { get; set; } = null!;

    public FriendStatus Status { get; set; } = FriendStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? AcceptedAt { get; set; }
}
