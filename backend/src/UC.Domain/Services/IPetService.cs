using UC.Domain.Models;
using UC.Infrastructure.Database.Entities;

namespace UC.Domain.Services;

public interface IPetService
{
    /// <summary>Получить питомца по ID с проверкой владельца</summary>
    Task<Pet?> GetPetAsync(Guid petId, Guid ownerId, CancellationToken ct = default);

    /// <summary>Получить всех питомцев игрока</summary>
    Task<List<Pet>> GetPetsByOwnerAsync(Guid ownerId, bool includeInactive = false, CancellationToken ct = default);

    /// <summary>Покормить питомца</summary>
    Task<Pet> FeedPetAsync(Guid petId, Guid ownerId, int foodValue, CancellationToken ct = default);

    /// <summary>Помыть питомца</summary>
    Task<Pet> WashPetAsync(Guid petId, Guid ownerId, CancellationToken ct = default);

    /// <summary>Поиграть с питомцем</summary>
    Task<Pet> PlayWithPetAsync(Guid petId, Guid ownerId, CancellationToken ct = default);

    /// <summary>Уложить питомца спать</summary>
    Task<Pet> PutPetToSleepAsync(Guid petId, Guid ownerId, CancellationToken ct = default);

    /// <summary>Вылечить питомца</summary>
    Task<Pet> HealPetAsync(Guid petId, Guid ownerId, CancellationToken ct = default);

    /// <summary>Переименовать питомца</summary>
    Task<Pet> RenamePetAsync(Guid petId, Guid ownerId, string newName, CancellationToken ct = default);

    /// <summary>Получить типы питомцев</summary>
    Task<List<PetType>> GetPetTypesAsync(CancellationToken ct = default);

    /// <summary>Активировать QR-код и получить питомца</summary>
    Task<Pet> ClaimPetFromQrAsync(Guid ownerId, string qrCode, CancellationToken ct = default);

    /// <summary>Проверить валидность QR-кода</summary>
    Task<bool> ValidateQrCodeAsync(string qrCode, CancellationToken ct = default);

    /// <summary>Активировать активного питомца</summary>
    Task<Pet> SetActivePetAsync(Guid petId, Guid ownerId, CancellationToken ct = default);
}