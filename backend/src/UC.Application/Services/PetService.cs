using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Logging;
using UC.Application.Repository;
using UC.Domain.Repository;
using UC.Domain.Services;
using UC.Infrastructure.Database;
using UC.Infrastructure.Database.Entities;

namespace UC.Application.Services;

///<inheritdoc cref="IPetService"/>
public class PetService(ILogger<PetService> logger,
                        IUcGameRepository repository) : IPetService
{
    public async Task<Pet?> GetPetAsync(Guid petId, Guid ownerId, CancellationToken ct = default)
        => await repository.GetPetAsync(petId, ownerId, ct);

    public async Task<List<Pet>> GetPetsByOwnerAsync(Guid ownerId, bool includeInactive = false, CancellationToken ct = default)
        => await repository.GetPetsByOwnerAsync(ownerId, includeInactive, ct);

    public async Task<Pet> FeedPetAsync(Guid petId, Guid ownerId, int foodValue, CancellationToken ct = default)
    {
        var pet = await GetPetAndValidateAsync(petId, ownerId, ct);

        // Проверяем, не ушёл ли питомец
        if (pet.LeftAt.HasValue)
        {
            throw new InvalidOperationException("Pet has already left");
        }

        // Обновляем сытость (максимум 100)
        pet.Satiety = Math.Min(100, pet.Satiety + foodValue);

        // Добавляем опыт
        var expGain = CalculateExpGain("feed");
        pet.Experience += expGain;

        await CheckAndUpdateStageAsync(pet, ct);


        pet.UpdatedAt = DateTime.UtcNow;

        // Обновляем статистику профиля
        await repository.UpdateProfileStatisticsAsync(ownerId, p => p.TotalFeedings++, ct);

        logger.LogInformation("Pet {PetId} fed by owner {OwnerId}, satiety: {Satiety}", petId, ownerId, pet.Satiety);

        return pet;
    }

    public async Task<Pet> WashPetAsync(Guid petId, Guid ownerId, CancellationToken ct = default)
    {
        var pet = await GetPetAndValidateAsync(petId, ownerId, ct);

        if (pet.LeftAt.HasValue)
        {
            throw new InvalidOperationException("Pet has already left");
        }

        pet.Cleanliness = Math.Min(100, pet.Cleanliness + 30);
        pet.Happiness = Math.Min(100, pet.Happiness + 5);

        var expGain = CalculateExpGain("wash");
        pet.Experience += expGain;

        await CheckAndUpdateStageAsync(pet, ct);

        pet.UpdatedAt = DateTime.UtcNow;

        await repository.UpdateProfileStatisticsAsync(ownerId, p => p.TotalWashings++, ct);

        return pet;
    }

    public async Task<Pet> PlayWithPetAsync(Guid petId, Guid ownerId, CancellationToken ct = default)
    {
        var pet = await GetPetAndValidateAsync(db, petId, ownerId, ct);

        if (pet.LeftAt.HasValue)
        {
            throw new InvalidOperationException("Pet has already left");
        }

        pet.Happiness = Math.Min(100, pet.Happiness + 25);
        pet.Energy = Math.Max(0, pet.Energy - 15);

        var expGain = CalculateExpGain("play");
        pet.Experience += expGain;

        await CheckAndUpdateStageAsync(pet, ct);

        pet.UpdatedAt = DateTime.UtcNow;

        await repository.UpdateProfileStatisticsAsync(ownerId, p => p.TotalPlayings++, ct);

        return pet;
    }

    public async Task<Pet> PutPetToSleepAsync(Guid petId, Guid ownerId, CancellationToken ct = default)
    {
        var pet = await GetPetAndValidateAsync(petId, ownerId, ct);

        if (pet.LeftAt.HasValue)
        {
            throw new InvalidOperationException("Pet has already left");
        }

        pet.Energy = Math.Min(100, pet.Energy + 40);

        var expGain = CalculateExpGain("sleep");
        pet.Experience += expGain;

        await CheckAndUpdateStageAsync(pet, ct);

        pet.UpdatedAt = DateTime.UtcNow;

        
        await repository.UpdateProfileStatisticsAsync(ownerId, p => p.TotalSleeps++, ct);

        return pet;
    }

    public async Task<Pet> HealPetAsync(Guid petId, Guid ownerId, CancellationToken ct = default)
    {
        var pet = await GetPetAndValidateAsync(petId, ownerId, ct);

        if (pet.LeftAt.HasValue)
        {
            throw new InvalidOperationException("Pet has already left");
        }

        if (!pet.IsSick)
        {
            throw new InvalidOperationException("Pet is not sick");
        }

        pet.IsSick = false;
        pet.Cleanliness = Math.Min(100, pet.Cleanliness + 40);
        pet.Happiness = Math.Min(100, pet.Happiness + 30);

        pet.UpdatedAt = DateTime.UtcNow;

        logger.LogInformation("Pet {PetId} healed by owner {OwnerId}", petId, ownerId);

        return pet;
    }

    public async Task<Pet> RenamePetAsync(Guid petId, Guid ownerId, string newName, CancellationToken ct = default)
    {
        var pet = await GetPetAndValidateAsync(petId, ownerId, ct);

        if (pet.LeftAt.HasValue)
        {
            throw new InvalidOperationException("Pet has already left");
        }

        if (string.IsNullOrWhiteSpace(newName))
        {
            throw new ArgumentException("Name cannot be empty");
        }

        pet.Name = newName.Trim();
        pet.UpdatedAt = DateTime.UtcNow;

        logger.LogInformation("Pet {PetId} renamed to {NewName}", petId, newName);

        return pet;
    }

    public async Task<List<PetType>> GetPetTypesAsync(CancellationToken ct = default)
        => await repository.GetPetTypesAsync(ct: ct);

    public async Task<Pet> ClaimPetFromQrAsync(Guid ownerId, string qrCode, CancellationToken ct = default)
    {

        // Проверяем, не использован ли уже этот QR-код
        var usedQr = await repository.GetUsedQrCodeAsync(qrCode, ct);

        if (usedQr != null)
        {
            throw new InvalidOperationException("QR code already used");
        }

        // Проверяем, есть ли профиль у игрока
        var profile = await repository.GetPlayerProfileAsync(ownerId, ct);

        if (profile != null)
        {
            throw new InvalidOperationException("Player profile not found");
        }

        var petTypes = await GetPetTypesAsync(ct: ct);
        
        // Выбираем случайный тип питомца
        if (petTypes.Count == 0)
        {
            throw new InvalidOperationException("No pet types available");
        }

        var random = new Random();
        var totalWeight = petTypes.Sum(t => t.SpawnWeight);
        var randomValue = random.NextDouble() * totalWeight;

        PetType? selectedType = null;
        var accumulatedWeight = 0.0;

        foreach (var type in petTypes)
        {
            accumulatedWeight += type.SpawnWeight;
            if (randomValue <= accumulatedWeight)
            {
                selectedType = type;
                break;
            }
        }

        selectedType ??= petTypes.First();

        // Создаём питомца (в ракушке, ещё не вылупился)
        var pet = new Pet
        {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            PetTypeId = selectedType.Id,
            PetType = selectedType,
            StageNumber = 1,
            Experience = 0,
            Satiety = 100,
            Energy = 100,
            Cleanliness = 100,
            Happiness = 100,
            IsActive = false, // Пока не вылупился
            ShellReceivedAt = DateTime.UtcNow,
            HatchAt = DateTime.UtcNow.AddHours(24), // 24 часа до вылупления
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await repository.AddPetAsync(pet);

        // Сохраняем использованный QR-код
        var used = new UsedQrCode
        {
            Id = Guid.CreateVersion7(),
            Code = qrCode,
            Type = Infrastructure.Database.Enum.QrCodeType.PetPackageShell,
            UsedByPlayerProfileId = profile.Id,
            UsedAt = DateTime.UtcNow
        };

        await repository.AddUsedQrCodeAsync(used);

        logger.LogInformation("Pet claimed from QR by owner {OwnerId}, pet type: {PetType}", ownerId, selectedType.Name);

        return pet;
    }

    public async Task<bool> ValidateQrCodeAsync(string qrCode, CancellationToken ct = default)
        => await repository.GetUsedQrCodeAsync(qrCode, ct) == null;

    public async Task<Pet> SetActivePetAsync(Guid petId, Guid ownerId, CancellationToken ct = default)
    {

        var pet = await GetPetAndValidateAsync(petId, ownerId, ct);

        if (pet.LeftAt.HasValue)
        {
            throw new InvalidOperationException("Pet has already left");
        }

        if (!pet.HatchedAt.HasValue)
        {
            throw new InvalidOperationException("Pet has not hatched yet");
        }

        await DeactivatePets(ownerId, ct);

        pet.IsActive = true;



        // Обновляем профиль
        var profile =  await .PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == ownerId, ct);

        if (profile != null)
        {
            profile.ActivePetId = petId;
            profile.UpdatedAt = DateTime.UtcNow;
        }

        repository.UpdateProfileAsync(ownerId, 
            new Domain.Models.UpdatePlayerProfileDto {
                ActivePetId = petId;
            }, 
            ct);

        await repository.UpdateProfileAsync(new {ActivePe} )

        pet.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        logger.LogInformation("Pet {PetId} set as active for owner {OwnerId}", petId, ownerId);

        return pet;
    }



    private int CalculateExpGain(string action)
    {
        return action switch
        {
            "feed" => 5 + Random.Shared.Next(0, 6),      // 5-10
            "wash" => 3 + Random.Shared.Next(0, 4),      // 3-6
            "play" => 4 + Random.Shared.Next(0, 5),      // 4-8
            "sleep" => 2 + Random.Shared.Next(0, 3),     // 2-4
            _ => 3
        };
    }

    /// <summary>Проверяем, не нужно ли повысить стадию</summary>
    private async Task CheckAndUpdateStageAsync(Pet pet, CancellationToken ct)
    {
        var stages = await repository.GetPetStagesAsync(pet, ct);
        foreach (var stage in stages)
        {
            if (pet.Experience >= stage.RequiredExp && pet.StageNumber < stage.StageNumber)
            {
                pet.StageNumber = stage.StageNumber;
                logger.LogInformation("Pet {PetId} reached stage {StageNumber}", pet.Id, stage.StageNumber);
            }
        }
    }

    private async Task<Pet> GetPetAndValidateAsync(Guid petId, Guid ownerId, CancellationToken ct)
    {
        var pet = await repository.GetPetAsync(petId, ownerId, ct);
        return pet == null
            ? throw new KeyNotFoundException($"Pet {petId} not found")
            : pet.OwnerId != ownerId ? throw new UnauthorizedAccessException("You don't own this pet") : pet;
    }

    /// <summary>Деактивируем всех питомцев владельца</summary>
    private async Task DeactivatePets(Guid ownerId, CancellationToken ct)
        => await repository.UpdatePetsAsync(ownerId, activePet => {
                    activePet.IsActive = false;
                }, ct: ct);
}