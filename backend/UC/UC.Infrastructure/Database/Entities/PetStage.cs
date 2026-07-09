namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// Стадия развития питомца (1 — малыш ... 10 — взрослый).
/// Если PetTypeId == null — стадия общая (дефолтная) для всех типов питомцев.
/// Если задан — переопределяет визуал/требования для конкретного типа (напр. другой узор).
/// </summary>
public class PetStage
{
    public Guid Id { get; set; }

    /// <summary>Номер стадии, от 1 до 10.</summary>
    public int StageNumber { get; set; }

    public string Name { get; set; } = null!;

    /// <summary>Сколько суммарного EXP требуется, чтобы достичь этой стадии.</summary>
    public int RequiredExp { get; set; }

    /// <summary>Ключ спрайта/визуального узора, аксессуара для данной стадии.</summary>
    public string SpriteKey { get; set; } = null!;

    /// <summary>Необязательная привязка к конкретному типу питомца (кастомный визуал стадии).</summary>
    public Guid? PetTypeId { get; set; }
    public PetType? PetType { get; set; }
}
