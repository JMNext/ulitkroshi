using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace UC.Infrastructure.Database;

public sealed class IdentityAppDbContextFactory : IDesignTimeDbContextFactory<IdentityAppDbContext>
{
    private string connectionString = "Host=localhost;Port=5432;Database=postgres;Username=egpu;Password=egpu";
    public IdentityAppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<IdentityAppDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new IdentityAppDbContext(optionsBuilder.Options);
    }
}