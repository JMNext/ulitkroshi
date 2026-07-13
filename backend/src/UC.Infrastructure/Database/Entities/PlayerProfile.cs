using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UC.Infrastructure.Database.Entities;

/// <summary>
/// Расширенный игровой профиль игрока. Связь 1:1 с учётной записью (ApplicationUser/Identity) через UserId.
/// Хранит игровые данные, не относящиеся к аутентификации напрямую (баланс, фруктовый код, привязка телефона).
/// </summary>
[Table(name: "player_profile", Schema = "dbo")]
public class PlayerProfile
{
    [Key]
    public Guid Id { get; set; }

    /// <summary>FK на ApplicationUser (Identity). Один пользователь — один игровой профиль.</summary>
    public Guid UserId { get; set; }

    /// <summary>Имя ребёнка / никнейм, отображаемый в игре (выбирается голосом или с клавиатуры).</summary>
    [MaxLength(50)]
    public string Nickname { get; set; } = null!;

    /// <summary>Индекс аватара, выбранного из матрицы 5x5 в настройках.</summary>
    public int AvatarIndex { get; set; }

    /// <summary>Внутриигровая валюта (монеты/печенье и т.п.).</summary>
    public long Balance { get; set; }

    /// <summary>Номер телефона, привязанный при регистрации (для SMS-кода и восстановления доступа).</summary>
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    public bool PhoneNumberConfirmed { get; set; }

    /// <summary>Хэш (bcrypt) фруктового кода-пароля из 4 фруктов, выбранных по порядку.</summary>
    public string? FruitCodeHash { get; set; }

    /// <summary>Счётчик неудачных попыток ввода фруктового кода подряд (для блокировки после 3 попыток).</summary>
    public int FailedFruitCodeAttempts { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }


    /// <summary>Заблокирован ли вход по фруктовому коду.</summary>
    public bool FruitCodeLocked { get; set; }

    /// <summary>Время разблокировки.</summary>
    public DateTime? FruitCodeLockedUntil { get; set; }

    /// <summary>Активный питомец.</summary>
    public Guid? ActivePetId { get; set; }

    /// <summary>Общий опыт.</summary>
    public int TotalExperience { get; set; }

    /// <summary>Уровень игрока.</summary>
    public int Level { get; set; }

    /// <summary>Количество игр.</summary>
    public int GamesPlayed { get; set; }
    public int GamesWon { get; set; }

    /// <summary>Статистика действий.</summary>
    public int TotalFeedings { get; set; }
    public int TotalWashings { get; set; }
    public int TotalPlayings { get; set; }
    public int TotalSleeps { get; set; }

    public DateTime? LastActiveAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Навигационные свойства
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<MiniGameResult> MiniGameResults { get; set; } = new List<MiniGameResult>();

    /// <summary>Заявки/связи, инициированные этим игроком.</summary>
    public ICollection<Friend> Friends { get; set; } = new List<Friend>();

    /// <summary>Заявки/связи, где этот игрок выступает как "друг" (входящая сторона).</summary>
    public ICollection<Friend> FriendOf { get; set; } = new List<Friend>();

    public ICollection<UsedQrCode> UsedQrCodes { get; set; } = new List<UsedQrCode>();
}
