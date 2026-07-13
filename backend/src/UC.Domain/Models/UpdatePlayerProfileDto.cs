using System.ComponentModel.DataAnnotations;

namespace UC.Domain.Models;

/// <summary>Публичный profile-эндпоинт: пользователь сам меняет только это</summary>
public class UpdatePlayerProfileDto
{
    [MaxLength(50)]
    public string? Nickname { get; set; }

    public int? AvatarIndex { get; set; }

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }
    public Guid? ActivePetId { get; set; }
}