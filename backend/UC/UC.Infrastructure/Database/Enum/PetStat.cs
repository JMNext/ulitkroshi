namespace UC.Infrastructure.Database.Enum;

/// <summary>Показатель состояния питомца, на который может влиять предмет/действие.</summary>
public enum PetStat
{
    Satiety = 0,     // Сытость
    Energy = 1,      // Бодрость
    Cleanliness = 2, // Чистота
    Happiness = 3    // Счастье
}