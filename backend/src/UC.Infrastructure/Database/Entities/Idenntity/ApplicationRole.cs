
using Microsoft.AspNetCore.Identity;

namespace UC.Infrastructure.Database.Entities.Identity;

/// <summary>
/// Роль пользователя (Identity)
/// </summary>
public class ApplicationRole : IdentityRole<Guid>
{
    // Базовые поля IdentityRole:
    // - Id (Guid)
    // - Name
    // - NormalizedName
    // - ConcurrencyStamp

    // Расширения:
    public string? Description { get; set; }          // Описание роли
    public bool IsSystem { get; set; } = false;       // Системная роль (нельзя удалить)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Навигация к пользователям
    public virtual ICollection<IdentityUserRole<Guid>> UserRoles { get; set; } = new List<IdentityUserRole<Guid>>();
    public virtual ICollection<IdentityRoleClaim<Guid>> RoleClaims { get; set; } = new List<IdentityRoleClaim<Guid>>();
}