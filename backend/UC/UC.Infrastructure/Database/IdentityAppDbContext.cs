using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Orion.Infrastructure.Database.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Orion.Infrastructure.Database;


public class IdentityAppDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public IdentityAppDbContext(DbContextOptions<IdentityAppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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
