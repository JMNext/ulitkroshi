using Microsoft.EntityFrameworkCore;
using UC.Infrastructure.Database.Entities;

namespace UC.Infrastructure.Database;

public class UcDbContext : DbContext
{
    public UcDbContext(DbContextOptions<UcDbContext> options)
       : base(options)
    {
    }

    public DbSet<PlayerProfile> PlayerProfiles => Set<PlayerProfile>();
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<PetType> PetTypes => Set<PetType>();
    public DbSet<PetStage> PetStages => Set<PetStage>();
    public DbSet<ItemDefinition> ItemDefinitions => Set<ItemDefinition>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Friend> Friends => Set<Friend>();
    public DbSet<UsedQrCode> UsedQrCodes => Set<UsedQrCode>();
    public DbSet<MiniGameResult> MiniGameResults => Set<MiniGameResult>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Конфигурация индексов
        ConfigureIndexes(modelBuilder);

        // Конфигурация отношений (каскадное удаление и т.д.)
        ConfigureRelationships(modelBuilder);
    }

    private void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        // --- PlayerProfile ---
        modelBuilder.Entity<PlayerProfile>(e =>
        {
            // Один пользователь Identity — один игровой профиль
            e.HasIndex(p => p.UserId).IsUnique();

            // Телефон уникален, но может отсутствовать (на старте после голосового онбординга ещё не привязан)
            e.HasIndex(p => p.PhoneNumber)
                .IsUnique()
                .HasFilter("\"PhoneNumber\" IS NOT NULL");

            e.HasIndex(p => p.Nickname);
        });

        // --- PetType ---
        modelBuilder.Entity<PetType>(e =>
        {
            e.HasIndex(t => t.Name).IsUnique();
        });

        // --- PetStage ---
        modelBuilder.Entity<PetStage>(e =>
        {
            // Для конкретного типа номер стадии уникален; для дефолтных (PetTypeId == null)
            // тоже не должно быть дублей одного и того же номера
            e.HasIndex(s => new { s.PetTypeId, s.StageNumber }).IsUnique();
        });

        // --- Pet ---
        modelBuilder.Entity<Pet>(e =>
        {
            e.HasIndex(p => p.OwnerId);

            // Быстрый поиск текущего активного питомца игрока
            e.HasIndex(p => new { p.OwnerId, p.IsActive });

            // Для "Моей коллекции" — группировка по типу в рамках одного владельца
            e.HasIndex(p => new { p.OwnerId, p.PetTypeId });
        });

        // --- ItemDefinition ---
        modelBuilder.Entity<ItemDefinition>(e =>
        {
            e.HasIndex(i => i.Name).IsUnique();
            e.HasIndex(i => i.Category);
        });

        // --- InventoryItem ---
        modelBuilder.Entity<InventoryItem>(e =>
        {
            // Один предмет данного типа — одна строка на владельца, количество суммируется
            e.HasIndex(i => new { i.OwnerId, i.ItemDefinitionId }).IsUnique();
        });

        // --- Transaction ---
        modelBuilder.Entity<Transaction>(e =>
        {
            // История баланса по игроку, отсортированная по времени
            e.HasIndex(t => new { t.PlayerProfileId, t.CreatedAt });
        });

        // --- Friend ---
        modelBuilder.Entity<Friend>(e =>
        {
            // Нельзя дважды добавить одного и того же друга от одного и того же инициатора
            e.HasIndex(f => new { f.PlayerProfileId, f.FriendProfileId }).IsUnique();
        });

        // --- UsedQrCode ---
        modelBuilder.Entity<UsedQrCode>(e =>
        {
            // Один и тот же физический QR-код нельзя активировать повторно
            e.HasIndex(q => q.Code).IsUnique();
        });

        // --- MiniGameResult ---
        modelBuilder.Entity<MiniGameResult>(e =>
        {
            // Для рейтингов/истории по игроку и типу игры
            e.HasIndex(r => new { r.PlayerProfileId, r.GameType, r.PlayedAt });
        });
    }

    private void ConfigureRelationships(ModelBuilder modelBuilder)
    {
        // --- PlayerProfile -> Pet (1:N) ---
        // Удаление профиля удаляет всю историю его питомцев
        modelBuilder.Entity<Pet>()
            .HasOne(p => p.Owner)
            .WithMany(pp => pp.Pets)
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- Pet -> PetType (N:1) ---
        // Справочник типов не должен удаляться, пока на него ссылаются питомцы
        modelBuilder.Entity<Pet>()
            .HasOne(p => p.PetType)
            .WithMany(t => t.Pets)
            .HasForeignKey(p => p.PetTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- PetStage -> PetType (N:1, опционально) ---
        modelBuilder.Entity<PetStage>()
            .HasOne(s => s.PetType)
            .WithMany(t => t.Stages)
            .HasForeignKey(s => s.PetTypeId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        // --- PlayerProfile -> InventoryItem (1:N) ---
        modelBuilder.Entity<InventoryItem>()
            .HasOne(i => i.Owner)
            .WithMany(pp => pp.InventoryItems)
            .HasForeignKey(i => i.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- InventoryItem -> ItemDefinition (N:1) ---
        modelBuilder.Entity<InventoryItem>()
            .HasOne(i => i.ItemDefinition)
            .WithMany(d => d.InventoryItems)
            .HasForeignKey(i => i.ItemDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- PlayerProfile -> Transaction (1:N) ---
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.PlayerProfile)
            .WithMany(pp => pp.Transactions)
            .HasForeignKey(t => t.PlayerProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- PlayerProfile -> MiniGameResult (1:N) ---
        modelBuilder.Entity<MiniGameResult>()
            .HasOne(r => r.PlayerProfile)
            .WithMany(pp => pp.MiniGameResults)
            .HasForeignKey(r => r.PlayerProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- PlayerProfile -> UsedQrCode (1:N) ---
        // Restrict: это аудиторская запись, её не должно сносить каскадом при удалении профиля
        modelBuilder.Entity<UsedQrCode>()
            .HasOne(q => q.UsedByPlayerProfile)
            .WithMany(pp => pp.UsedQrCodes)
            .HasForeignKey(q => q.UsedByPlayerProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- Friend: две связи с PlayerProfile (инициатор / приглашённый) ---
        // Обе — Restrict, иначе EF Core/PostgreSQL упадёт на "multiple cascade paths"
        modelBuilder.Entity<Friend>()
            .HasOne(f => f.PlayerProfile)
            .WithMany(pp => pp.Friends)
            .HasForeignKey(f => f.PlayerProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Friend>()
            .HasOne(f => f.FriendProfile)
            .WithMany(pp => pp.FriendOf)
            .HasForeignKey(f => f.FriendProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- Числовые поля ---
        modelBuilder.Entity<PlayerProfile>()
            .Property(p => p.Balance)
            .HasDefaultValue(0L);

        modelBuilder.Entity<Transaction>()
            .Property(t => t.Amount)
            .IsRequired();
    }
}
