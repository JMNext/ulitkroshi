using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Orion.Infrastructure.Database;

public sealed class OrionDbContextFactory : IDesignTimeDbContextFactory<OrionDbContext>
{
    private string connectionString = "Host=localhost;Port=5432;Database=postgres;Username=egpu;Password=egpu";
    public OrionDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<OrionDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new OrionDbContext(optionsBuilder.Options);
    }
}