using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Orion.Infrastructure.Database;
using Orion.Infrastructure.Database.Seeds;
using Orion.Infrastructure.Settings;
using Serilog;
using SeriLogger = Serilog.Core.Logger;
using ME = Orion.Infrastructure.Database.MigrationExtentions;

namespace Orion.Infrastructure;

public static class ApplicationBuilderExtensions
{
    public static IServiceCollection AddApplicationLogging(this IServiceCollection services, IConfiguration configuration)
    {
        var serviceSettings = new ServiceSettings();
        configuration.GetSection("ServiceSettings").Bind(serviceSettings);

        Log.Logger = CreateLogger(configuration, serviceSettings);
        _ = services.Configure<ServiceSettings>(configuration.GetSection("ServiceSettings"));

        _ = services.AddLogging(loggingBuilder =>
        {
            _ = loggingBuilder.ClearProviders();
            _ = loggingBuilder.AddSerilog(Log.Logger, dispose: true);
        });

        return services;
    }

    public static async Task ApplyMigrationsAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<ME>>();

        try
        {
            logger.LogInformation("Starting database migrations...");
            var miniCrmContext = services.GetRequiredService<OrionDbContext>();
            var identityContext = services.GetRequiredService<IdentityAppDbContext>();

            if (miniCrmContext.Database.IsRelational())
            {
                // Миграции для бизнес контекста
                logger.LogInformation("Applying migrations for MiniCrmDbContext...");
                await miniCrmContext.Database.MigrateAsync();

                // Миграции для Identity контекста
                logger.LogInformation("Applying migrations for IdentityAppDbContext...");
                await identityContext.Database.MigrateAsync();

                logger.LogInformation("All migrations completed successfully");
            }
            else
            {
                // Для InMemory просто создаем БД
                logger.LogInformation("Using InMemory database, skipping migrations...");
                await miniCrmContext.Database.EnsureCreatedAsync();
                await identityContext.Database.EnsureCreatedAsync();
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while applying migrations");
            throw;
        }
    }

    public static IServiceCollection AddSeeding(this IServiceCollection services)
    {
        services.AddScoped<IDbSeeder, IdentityDbSeed>();
        return services;
    }

    public static async Task SeedDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OrionDbContext>();
        await dbContext.Database.EnsureCreatedAsync();

        var seeder = scope.ServiceProvider.GetRequiredService<IDbSeeder>();
        await seeder.SeedAsync();
    }

    private static SeriLogger CreateLogger(IConfiguration configuration, ServiceSettings serviceSettings)
    {
        var loggerConfiguration = new LoggerConfiguration()
            .ReadFrom.Configuration(configuration)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Service", serviceSettings.Name)
            .Enrich.WithProperty("Version", serviceSettings.Version)
            .Enrich.WithMachineName()
            .Enrich.WithThreadId();

        loggerConfiguration = Logging.ApplyServiceSettings(loggerConfiguration, serviceSettings);

        return loggerConfiguration.CreateLogger();
    }
}
