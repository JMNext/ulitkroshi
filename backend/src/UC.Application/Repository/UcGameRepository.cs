using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Logging;
using UC.Application.DTOs;
using UC.Application.Services;
using UC.Domain.Models;
using UC.Domain.Repository;
using UC.Infrastructure.Database;
using UC.Infrastructure.Database.Entities;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace UC.Application.Repository;

public class UcGameRepository(IDbContextFactory<UcDbContext> dbContextFactory,
                              // ILogger<PetService> logger,
                              IMapper mapper) : IUcGameRepository
{
    public async Task<List<PetStage>> GetPetStagesAsync(Pet pet, CancellationToken ct)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);

        // Получаем пороги для стадий
        return await db.PetStages
            .Where(s => s.PetTypeId == null || s.PetTypeId == pet.PetTypeId)
            .OrderBy(s => s.StageNumber)
            .ToListAsync(ct);
    }

    public async Task UpdateProfileStatisticsAsync(Guid userId, Action<PlayerProfile> updateAction, CancellationToken ct)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);

        var profile = await db.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);

        if (profile != null)
        {
            updateAction(profile);
            profile.UpdatedAt = DateTime.UtcNow;
        }
        _ = await db.SaveChangesAsync(ct);
    }
    public async Task UpdatePetsAsync(Guid userId, Action<Pet> updateAction, CancellationToken ct, bool? isActive = null)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);

        var query = db.Pets
            .Where(p => p.OwnerId == userId);
        if (isActive != null)
        {
            query = query.Where(p => p.IsActive == (isActive ?? false));
        }

        var pets = await query.AsTracking().ToListAsync(cancellationToken: ct);

        foreach (var pet in pets)
        {
            updateAction(pet);
            pet.UpdatedAt = DateTime.UtcNow;
        }

        _ = await db.SaveChangesAsync(ct);
    }

    public async Task UpdateProfileStatisticsAsync(Guid userId, UpdatePlayerStatsDto dto, CancellationToken ct)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);

        var profile = await db.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);

        if (profile is null)
        {
            return;
        }

        _= mapper.Map(dto, profile);
        profile.UpdatedAt = DateTime.UtcNow;

        _ = await db.SaveChangesAsync(ct);
    }

    public async Task UpdateProfileAsync(Guid userId, UpdatePlayerProfileDto dto, CancellationToken ct)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);

        var profile = await db.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);

        if (profile is null)
        {
            return;
        }

        _=mapper.Map(dto, profile);
        profile.UpdatedAt = DateTime.UtcNow;

        _ = await db.SaveChangesAsync(ct);
    }

    public async Task<Pet?> GetPetAsync(Guid petId, Guid ownerId, CancellationToken ct = default, bool? isActive = null)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);

        var query = db.Pets
            .Include(p => p.PetType)
            .Where(p => p.Id == petId && p.OwnerId == ownerId);
        if (isActive != null)
        {
            query = query.Where(p => p.IsActive == (isActive ?? false));
        }

        return await query.FirstOrDefaultAsync(ct);
    }

    public async Task<List<Pet>> GetPetsByOwnerAsync(Guid ownerId, bool includeInactive = false, CancellationToken ct = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);

        var query = db.Pets
            .Include(p => p.PetType)
            .Where(p => p.OwnerId == ownerId);

        if (!includeInactive)
        {
            query = query.Where(p => p.IsActive);
        }

        return await query
            .OrderByDescending(p => p.IsActive)
            .ThenBy(p => p.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<List<PetType>> GetPetTypesAsync(bool isActive = true, CancellationToken ct = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);

        return await db.PetTypes
            .Where(t => t.IsActive == isActive)
            .OrderBy(t => t.Name)
            .ToListAsync(ct);
    }
    public async Task<UsedQrCode?> GetUsedQrCodeAsync(string qrCode, CancellationToken ct = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);

        return await db.UsedQrCodes
            .FirstOrDefaultAsync(q => q.Code == qrCode, ct);
    }

    public async Task<PlayerProfile?> GetPlayerProfileAsync(Guid userId, CancellationToken ct = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);

        return await db.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);
    }

    public async Task AddPetAsync(Pet pet, CancellationToken ct = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);
        _= await db.Pets.AddAsync(pet, ct);

        _ = await db.SaveChangesAsync(ct);
    }

    public async Task AddUsedQrCodeAsync(UsedQrCode qrCode, CancellationToken ct = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(ct);
        _ = await db.UsedQrCodes.AddAsync(qrCode, ct);

        _ = await db.SaveChangesAsync(ct);
    }
}
