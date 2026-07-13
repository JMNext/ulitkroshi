using UC.Infrastructure.Database.Entities;

namespace UC.Domain.Services;

public interface IPlayerProfileService
{
    /// <summary>Получить профиль игрока</summary>
    Task<PlayerProfile?> GetProfileAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Получить или создать профиль</summary>
    Task<PlayerProfile> GetOrCreateProfileAsync(Guid userId, string nickname, string? phoneNumber, CancellationToken ct = default);

    /// <summary>Сменить аватар</summary>
    Task<PlayerProfile> ChangeAvatarAsync(Guid userId, int avatarIndex, CancellationToken ct = default);

    /// <summary>Получить статистику игрока</summary>
    Task<PlayerProfile> GetStatisticsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Обновить баланс</summary>
    Task<PlayerProfile> UpdateBalanceAsync(Guid userId, long amount, string? description = null, CancellationToken ct = default);

    /// <summary>Получить инвентарь</summary>
    Task<List<InventoryItem>> GetInventoryAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Купить предмет</summary>
    Task<InventoryItem> BuyItemAsync(Guid userId, Guid itemDefinitionId, int quantity, CancellationToken ct = default);

    /// <summary>Получить список друзей</summary>
    Task<List<Friend>> GetFriendsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Добавить друга по QR-коду</summary>
    Task<Friend> AddFriendAsync(Guid userId, string friendQrCode, CancellationToken ct = default);

    /// <summary>Удалить друга</summary>
    Task<bool> RemoveFriendAsync(Guid userId, Guid friendId, CancellationToken ct = default);

    /// <summary>Получить глобальный рейтинг</summary>
    Task<List<PlayerProfile>> GetGlobalRankingAsync(int topCount = 100, CancellationToken ct = default);
}