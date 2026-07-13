using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using UC.Infrastructure.Database.Entities.Identity;

namespace UC.Infrastructure.Database;


public class IdentityAppDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public IdentityAppDbContext(DbContextOptions<IdentityAppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("User"); // ← Теперь будет использоваться "User"

            // Настройка индексов и свойств
            entity.HasIndex(u => u.NormalizedEmail).HasDatabaseName("EmailIndex");
            entity.HasIndex(u => u.NormalizedUserName).HasDatabaseName("UserNameIndex");

            // Игнорируем свойства, которых нет в таблице
            entity.Ignore(u => u.Sessions);
        });

        modelBuilder.Entity<ApplicationRole>(entity =>
        {
            entity.ToTable("Role"); // ← Теперь будет использоваться "Role"
        });

        modelBuilder.Entity<IdentityUserClaim<Guid>>(entity =>
        {
            entity.ToTable("UserClaims");
        });

        modelBuilder.Entity<IdentityUserRole<Guid>>(entity =>
        {
            entity.ToTable("UserRoles");
        });

        modelBuilder.Entity<IdentityUserLogin<Guid>>(entity =>
        {
            entity.ToTable("UserLogins");
        });

        modelBuilder.Entity<IdentityRoleClaim<Guid>>(entity =>
        {
            entity.ToTable("RoleClaims");
        });

        modelBuilder.Entity<IdentityUserToken<Guid>>(entity =>
        {
            entity.ToTable("UserTokens");
        });

    }
}
