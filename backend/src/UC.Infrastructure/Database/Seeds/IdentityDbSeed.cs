using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UC.Infrastructure.Database.Entities;
using UC.Infrastructure.Database.Entities.Identity;
using BCrypt.Net;

namespace UC.Infrastructure.Database.Seeds;

public class IdentityDbSeed : IDbSeeder
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly UcDbContext _ucDbContext;
    private readonly ILogger<IdentityDbSeed> _logger;

    public IdentityDbSeed(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        UcDbContext ucDbContext,
        ILogger<IdentityDbSeed> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _ucDbContext = ucDbContext;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            await SeedRolesAsync();
            await SeedUsersAsync();
            _logger.LogInformation("Identity seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the identity database");
            throw;
        }
    }

    private async Task SeedRolesAsync()
    {
        var roles = new List<(string Name, string Description, bool IsSystem)>
        {
            ("Player", "Обычный игрок. Базовый доступ к игровым функциям.", true),
            ("Admin", "Полный доступ ко всем функциям системы. Управление пользователями, модерация, аналитика.", true),
            ("Moderator", "Модератор. Просмотр жалоб, управление контентом, поддержка игроков.", true)
        };

        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role.Name))
            {
                var appRole = new ApplicationRole
                {
                    Name = role.Name,
                    NormalizedName = role.Name.ToUpperInvariant(),
                    Description = role.Description,
                    IsSystem = role.IsSystem,
                    CreatedAt = DateTime.UtcNow
                };

                await _roleManager.CreateAsync(appRole);
                _logger.LogDebug("Role {RoleName} created", role.Name);
            }
            else
            {
                _logger.LogDebug("Role {RoleName} already exists", role.Name);
            }
        }
    }

    private async Task SeedUsersAsync()
    {
        // === АДМИНИСТРАТОРЫ (с email и паролем) ===
        var adminUsers = new List<(string Email, string UserName, string Nickname, string Role, string Password, string PhoneNumber, int AvatarIndex)>
        {
            (
                Email: "admin@ulitkroshi.ru",
                UserName: "admin",
                Nickname: "Главный Улиткрош",
                Role: "Admin",
                Password: "Admin123!",
                PhoneNumber: "+79990000101",
                AvatarIndex: 0
            ),
            (
                Email: "moderator@ulitkroshi.ru",
                UserName: "moderator",
                Nickname: "Смотритель Ракушек",
                Role: "Moderator",
                Password: "Moderator123!",
                PhoneNumber: "+79990000102",
                AvatarIndex: 1
            )
        };

        foreach (var userData in adminUsers)
        {
            await SeedAdminUserAsync(
                userData.Email,
                userData.UserName,
                userData.Nickname,
                userData.Role,
                userData.Password,
                userData.PhoneNumber,
                userData.AvatarIndex
            );
        }

        // === ИГРОКИ (без пароля, с фруктовым кодом) ===
        var playerUsers = new List<(string UserName, string Nickname, string PhoneNumber, int AvatarIndex, List<string> FruitCode)>
        {
            (
                UserName: "misha",
                Nickname: "Миша",
                PhoneNumber: "+79990000103",
                AvatarIndex: 2,
                FruitCode: new List<string> { "apple", "banana", "orange", "grape" }
            ),
            (
                UserName: "alisa",
                Nickname: "Алиса",
                PhoneNumber: "+79990000104",
                AvatarIndex: 3,
                FruitCode: new List<string> { "strawberry", "apple", "banana", "grape" }
            ),
            (
                UserName: "dima",
                Nickname: "Дима",
                PhoneNumber: "+79990000105",
                AvatarIndex: 4,
                FruitCode: new List<string> { "apple", "grape", "orange", "strawberry" }
            )
        };

        foreach (var userData in playerUsers)
        {
            await SeedPlayerUserAsync(
                userData.UserName,
                userData.Nickname,
                userData.PhoneNumber,
                userData.AvatarIndex,
                userData.FruitCode
            );
        }
    }

    /// <summary>
    /// Создание администратора/модератора (с email и паролем)
    /// </summary>
    private async Task SeedAdminUserAsync(
        string email,
        string userName,
        string nickname,
        string role,
        string password,
        string phoneNumber,
        int avatarIndex)
    {
        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser == null)
        {
            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = userName,
                NormalizedUserName = userName.ToUpperInvariant(),
                Email = email,
                NormalizedEmail = email.ToUpperInvariant(),
                EmailConfirmed = true,
                PhoneNumber = phoneNumber,
                PhoneNumberConfirmed = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                TwoFactorEnabled = false,
                LockoutEnabled = true
            };

            var result = await _userManager.CreateAsync(user, password);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, role);
                _logger.LogInformation("Admin/Moderator {Nickname} ({Role}) created with email {Email}", nickname, role, email);

                // Создаём профиль
                await SeedPlayerProfileAsync(user.Id, nickname, phoneNumber, avatarIndex, null);
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("Failed to create admin {Email}: {Errors}", email, errors);
            }
        }
        else
        {
            // Проверяем роль
            if (!await _userManager.IsInRoleAsync(existingUser, role))
            {
                await _userManager.AddToRoleAsync(existingUser, role);
                _logger.LogDebug("Role {Role} added to existing user {Email}", role, email);
            }

            // Проверяем наличие профиля
            var profile = await _ucDbContext.PlayerProfiles
                .FirstOrDefaultAsync(p => p.UserId == existingUser.Id);

            if (profile == null)
            {
                await SeedPlayerProfileAsync(existingUser.Id, nickname, phoneNumber, avatarIndex, null);
            }

            _logger.LogDebug("Admin/Moderator {Email} already exists", email);
        }
    }

    /// <summary>
    /// Создание игрока (без пароля, с фруктовым кодом)
    /// </summary>
    private async Task SeedPlayerUserAsync(
        string userName,
        string nickname,
        string phoneNumber,
        int avatarIndex,
        List<string> fruitCode)
    {
        // Используем телефон как UserName для поиска
        var existingUser = await _userManager.FindByNameAsync(phoneNumber);

        if (existingUser == null)
        {
            // Генерируем случайный пароль (игроки не используют пароль)
            var randomPassword = GenerateRandomPassword();

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = phoneNumber, // Используем телефон как UserName
                NormalizedUserName = phoneNumber.ToUpperInvariant(),
                Email = null, // У игроков нет email
                NormalizedEmail = null,
                EmailConfirmed = false,
                PhoneNumber = phoneNumber,
                PhoneNumberConfirmed = false, // Будет подтверждён через SMS
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                TwoFactorEnabled = false,
                LockoutEnabled = true
            };

            var result = await _userManager.CreateAsync(user, randomPassword);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "Player");
                _logger.LogInformation("Player {Nickname} created with phone {PhoneNumber}", nickname, phoneNumber);

                // Хэшируем фруктовый код
                var fruitCodeString = string.Join(",", fruitCode);
                var fruitCodeHash = BCrypt.Net.BCrypt.HashPassword(fruitCodeString);

                // Создаём профиль
                await SeedPlayerProfileAsync(user.Id, nickname, phoneNumber, avatarIndex, fruitCodeHash);
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("Failed to create player {Nickname}: {Errors}", nickname, errors);
            }
        }
        else
        {
            // Проверяем, что пользователь имеет роль Player
            if (!await _userManager.IsInRoleAsync(existingUser, "Player"))
            {
                await _userManager.AddToRoleAsync(existingUser, "Player");
                _logger.LogDebug("Role Player added to existing user {PhoneNumber}", phoneNumber);
            }

            // Проверяем наличие профиля
            var profile = await _ucDbContext.PlayerProfiles
                .FirstOrDefaultAsync(p => p.UserId == existingUser.Id);

            if (profile == null)
            {
                var fruitCodeString = string.Join(",", fruitCode);
                var fruitCodeHash = BCrypt.Net.BCrypt.HashPassword(fruitCodeString);
                await SeedPlayerProfileAsync(existingUser.Id, nickname, phoneNumber, avatarIndex, fruitCodeHash);
            }

            _logger.LogDebug("Player {PhoneNumber} already exists", phoneNumber);
        }
    }

    /// <summary>
    /// Создание игрового профиля
    /// </summary>
    private async Task SeedPlayerProfileAsync(
        Guid userId,
        string nickname,
        string phoneNumber,
        int avatarIndex,
        string? fruitCodeHash)
    {
        var profile = new PlayerProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Nickname = nickname,
            AvatarIndex = avatarIndex,
            PhoneNumber = phoneNumber,
            PhoneNumberConfirmed = false, // Требует подтверждения
            FruitCodeHash = fruitCodeHash,
            Balance = 100, // Стартовый баланс
            Level = 1,
            TotalExperience = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _ucDbContext.PlayerProfiles.AddAsync(profile);
        await _ucDbContext.SaveChangesAsync();

        _logger.LogInformation("Player profile created for {Nickname}", nickname);
    }

    /// <summary>
    /// Генерация случайного пароля для игроков (они его не используют)
    /// </summary>
    private string GenerateRandomPassword()
    {
        // 40 символов — достаточно для безопасности
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray())
               + Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    }
}