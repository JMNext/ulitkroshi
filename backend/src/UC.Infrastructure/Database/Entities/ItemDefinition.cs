using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using UC.Infrastructure.Database.Enum;

namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// Справочник предметов магазина: еда, украшения питомца, предметы для домика, лекарства.
/// </summary>
[Table(name: "item_definition", Schema = "dbo")]
public class ItemDefinition
{
    [Key]
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public ItemCategory Category { get; set; }

    /// <summary>На какой показатель питомца влияет предмет (для еды/лечения). Null — не влияет напрямую (декор).</summary>
    public PetStat? EffectStat { get; set; }

    /// <summary>Величина эффекта, добавляемая к показателю при использовании.</summary>
    public int EffectValue { get; set; }

    /// <summary>Цена в магазине во внутриигровой валюте.</summary>
    public long Price { get; set; }

    public string? Description { get; set; }

    /// <summary>Ключ иконки/спрайта предмета.</summary>
    public string IconKey { get; set; } = null!;

    public bool IsAvailableInShop { get; set; } = true;

    public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
}
