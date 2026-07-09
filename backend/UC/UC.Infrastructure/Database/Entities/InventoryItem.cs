namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// Предмет в инвентаре конкретного игрока — сколько штук куплено/получено.
/// Одна запись на пару (Owner, ItemDefinition), количество наращивается, а не дублируется строками.
/// </summary>
public class InventoryItem
{
    public Guid Id { get; set; }

    public Guid OwnerId { get; set; }
    public PlayerProfile Owner { get; set; } = null!;

    public Guid ItemDefinitionId { get; set; }
    public ItemDefinition ItemDefinition { get; set; } = null!;

    public int Quantity { get; set; } = 1;

    public DateTime AcquiredAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
