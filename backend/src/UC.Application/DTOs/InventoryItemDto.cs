namespace UC.Application.DTOs;

public class InventoryItemDto
{
    public Guid Id { get; set; }
    public ItemDefinitionDto Item { get; set; } = null!;
    public int Quantity { get; set; }
}
