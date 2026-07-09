using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Orion.Infrastructure.Database.Entities;

namespace Orion.Infrastructure.Database.Seeds;

public class IdentityDbSeed(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ILogger<IdentityDbSeed> logger) : IDbSeeder
{


    public async Task SeedAsync()
    {
        try
        {
            await SeedRolesAsync();
            await SeedUsersAsync();
            logger.LogInformation("Identity seeding completed successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the identity database");
            throw;
        }
    }

    private async Task SeedRolesAsync()
    {
        var roles = new List<(string Name, string Description)>
        {
            ("Admin", "Полный доступ ко всем функциям системы. Управление пользователями, настройками и просмотр всей аналитики."),
            ("Doctor", "Доступ к расписанию, записям пациентов, истории звонков. Может просматривать и редактировать свои приёмы."),
            ("Operator", "Обработка входящих звонков, создание клиентов и записей. Просмотр транскрипций диалогов с AI.")
        };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role.Name))
            {
                await roleManager.CreateAsync(new ApplicationRole
                {
                    Name = role.Name,
                    Description = role.Description
                });
                logger.LogDebug("Role {RoleName} created", role.Name);
            }
            else
            {
                logger.LogDebug("Role {RoleName} already exists", role.Name);
            }
        }
    }

    private async Task SeedUsersAsync()
    {
        var users = new List<(string Email, string FirstName, string LastName, string MiddleName, string Role, string Password, string PhoneNumber)>
        {
            (
                Email: "admin@orion.ru",
                FirstName: "Алексей",
                LastName: "Администраторов",
                MiddleName: "Сергеевич",
                Role: "Admin",
                Password: "Admin123!",
                PhoneNumber: "+79990000101"
            ),
            (
                Email: "doctor@orion.ru",
                FirstName: "Иван",
                LastName: "Врачебников",
                MiddleName: "Петрович",
                Role: "Doctor",
                Password: "Doctor123!",
                PhoneNumber: "+79990000102"
            ),
            (
                Email: "operator@orion.ru",
                FirstName: "Елена",
                LastName: "Операторова",
                MiddleName: "Владимировна",
                Role: "Operator",
                Password: "Operator123!",
                PhoneNumber: "+79990000103"
            ),
            (
                Email: "yzuev.su+orion@yandex.ru",
                FirstName: "Юрий",
                LastName: "Иванов",
                MiddleName: "Андреевич",
                Role: "Admin",
                Password: "Admin123!",
                PhoneNumber: "+79990000100"
            )
        };

        foreach (var userData in users)
        {
            await SeedUserAsync(
                userData.Email,
                userData.FirstName,
                userData.LastName,
                userData.MiddleName,
                userData.Role,
                userData.Password,
                userData.PhoneNumber
            );
        }
    }

    private async Task SeedUserAsync(
        string email,
        string firstName,
        string lastName,
        string middleName,
        string role,
        string password,
        string phoneNumber)
    {
        var existingUser = await userManager.FindByEmailAsync(email);

        if (existingUser == null)
        {
            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = email,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                MiddleName = middleName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                EmailConfirmed = true,
                PhoneNumber = phoneNumber,
                PhoneNumberConfirmed = true,
                TimeZone = "Europe/Moscow",
                Language = "ru-RU"
            };

            var result = await userManager.CreateAsync(user, password);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, role);
                logger.LogInformation("User {FirstName} {LastName} ({Role}) created with email {Email}",
                    firstName, lastName, role, email);
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogError("Failed to create user {Email}: {Errors}", email, errors);
            }
        }
        else
        {
            // Проверяем и обновляем роль если нужно
            if (!await userManager.IsInRoleAsync(existingUser, role))
            {
                await userManager.AddToRoleAsync(existingUser, role);
                logger.LogDebug("Role {Role} added to existing user {Email}", role, email);
            }

            logger.LogDebug("User {Email} already exists", email);
        }
    }
}