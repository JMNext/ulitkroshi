using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// Экземпляр питомца, принадлежащий игроку. Хранит и текущего активного питомца, и историю
/// (ушедших/предыдущих) — на основании этой истории строится экран "Моя коллекция"
/// (группировка по PetType.Name/Color с подсчётом количества).
/// </summary>
[Table(name: "pet", Schema = "dbo")]
public class Pet
{
    [Key]
    public Guid Id { get; set; }

    public Guid OwnerId { get; set; }
    public PlayerProfile Owner { get; set; } = null!;

    public Guid PetTypeId { get; set; }
    public PetType PetType { get; set; } = null!;

    /// <summary>Имя, выбранное ребёнком из предложенных вариантов после вылупления.</summary>
    public string? Name { get; set; }

    /// <summary>Текущая стадия развития (1-10). Дублируется числом для быстрых выборок/сортировок.</summary>
    public int StageNumber { get; set; } = 1;

    public int Experience { get; set; }

    // Показатели состояния, шкала 0-100
    public int Satiety { get; set; } = 100;
    public int Energy { get; set; } = 100;
    public int Cleanliness { get; set; } = 100;
    public int Happiness { get; set; } = 100;

    /// <summary>Питомец заболел (Чистота или Счастье упали ниже порога) — показывается иконка градусника.</summary>
    public bool IsSick { get; set; }

    /// <summary>
    /// Текущий активный питомец игрока. В любой момент времени активен только один Pet на OwnerId
    /// (обеспечивается на уровне сервиса + фильтрованным уникальным индексом).
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Когда получена ракушка (сканирование QR) и запущен таймер "рождения".</summary>
    public DateTime ShellReceivedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Запланированное время окончания таймера вылупления (с учётом возможных ускорений).</summary>
    public DateTime? HatchAt { get; set; }

    /// <summary>Фактическое время вылупления (появления Улиткроша из ракушки).</summary>
    public DateTime? HatchedAt { get; set; }

    /// <summary>Заполняется, если питомец ушёл от хозяина (один из показателей упал до 0%).</summary>
    public DateTime? LeftAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
