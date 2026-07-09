namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// Справочник базовых типов Улиткрошей: архетип + цвет + редкость.
/// Определяет, какая ракушка выпадает при сканировании QR-кода с упаковки.
/// </summary>
public class PetType
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Color { get; set; } = null!;

    public PetRarity Rarity { get; set; }

    /// <summary>Относительный вес для случайного выпадения из ракушки (чем выше — тем чаще выпадает).</summary>
    public int SpawnWeight { get; set; } = 100;

    public string? Description { get; set; }

    /// <summary>Ключ базового спрайта/атласа для отрисовки в Phaser 3.</summary>
    public string BaseSpriteKey { get; set; } = null!;

    public bool IsActive { get; set; } = true;

    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    public ICollection<PetStage> Stages { get; set; } = new List<PetStage>();
}
