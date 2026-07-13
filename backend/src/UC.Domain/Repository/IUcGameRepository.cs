using UC.Domain.Models;
using UC.Infrastructure.Database.Entities;

namespace UC.Domain.Repository;

public interface IUcGameRepository
{
    public Task UpdateProfileStatisticsAsync(Guid userId, Action<PlayerProfile> updateAction, CancellationToken ct);
    public Task UpdateProfileStatisticsAsync(Guid userId, UpdatePlayerStatsDto dto, CancellationToken ct);
    Task UpdateProfileAsync(Guid userId, UpdatePlayerProfileDto dto, CancellationToken ct);
    public Task<List<PetStage>> GetPetStagesAsync(Pet pet, CancellationToken ct);
    public Task<Pet?> GetPetAsync(Guid petId, Guid ownerId, CancellationToken ct, bool? isActive = null);
    public Task UpdatePetsAsync(Guid ownerId, Action<Pet> updateAction, CancellationToken ct, bool? isActive = null);
    public Task<List<Pet>> GetPetsByOwnerAsync(Guid ownerId, bool includeInactive = false, CancellationToken ct = default);
    public Task<List<PetType>> GetPetTypesAsync(bool isActive = true, CancellationToken ct = default);
    public Task<UsedQrCode> GetUsedQrCodeAsync(string qrCode, CancellationToken ct = default);
    public Task AddUsedQrCodeAsync(UsedQrCode qrCode, CancellationToken ct = default);
    public Task<PlayerProfile?> GetPlayerProfileAsync(Guid userId, CancellationToken ct = default);
    public Task AddPetAsync(Pet pet, CancellationToken ct = default);
}
