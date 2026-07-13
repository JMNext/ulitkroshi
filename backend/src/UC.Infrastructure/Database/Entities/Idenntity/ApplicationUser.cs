using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UC.Infrastructure.Database.Entities.Identity;

[Table("User")]
public class ApplicationUser : IdentityUser<Guid>
{
    [MaxLength(100)]
    public string? FirstName { get; set; }

    [MaxLength(100)]
    public string? LastName { get; set; }

    [MaxLength(100)]
    public string? MiddleName { get; set; }

    // Preferences
    [MaxLength(50)]
    public string? TimeZone { get; set; } = "Europe/Moscow";

    [MaxLength(20)]
    public string? Language { get; set; } = "ru-RU";

    // Avatar
    [MaxLength(500)]
    public string? AvatarKey { get; set; }

    [MaxLength(100)]
    public string? AvatarBucket { get; set; }

    public DateTime? AvatarUpdatedAt { get; set; }

    // Tenant
    public Guid? TenantId { get; set; }

    // Status
    public bool IsActive { get; set; } = true;

    // Audit timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }

    // Audit users
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public Guid? DeletedByUserId { get; set; }

    // Navigation properties
    public virtual ICollection<UserSession> Sessions { get; set; } = new List<UserSession>();

    // Computed properties
    [NotMapped]
    public string FullName => $"{LastName} {FirstName} {MiddleName}".Trim();

    [NotMapped]
    public string ShortName => $"{LastName} {FirstName?.FirstOrDefault()}".Trim();

    [NotMapped]
    public string DisplayName => string.IsNullOrEmpty(FullName) ? Email ?? UserName ?? "Unknown" : FullName;

    [NotMapped]
    public bool IsDeleted => DeletedAt is not null;

    //[NotMapped]
    //public bool IsDoctor => UserRoles?.Contains("Doctor") ?? false;
}
