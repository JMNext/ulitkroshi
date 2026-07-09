namespace UC.Infrastructure.Database.Enum;

/// <summary>Редкость типа питомца (влияет на очки в глобальном рейтинге: Очки = Редкость * Уровень).</summary>
public enum PetRarity
{
    Common = 0,
    Uncommon = 1,
    Rare = 2,
    Epic = 3,
    Legendary = 4
}