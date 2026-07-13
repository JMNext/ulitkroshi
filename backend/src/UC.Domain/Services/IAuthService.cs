using UC.Infrastructure.Database.Entities;

namespace UC.Domain.Services;

public interface IAuthDomainService
{
    /// <summary>Регистрация нового игрока</summary>
    Task<PlayerProfile> RegisterAsync(string phoneNumber, string nickname, string fruitCodeString, CancellationToken ct = default);

    /// <summary>Запрос SMS-кода</summary>
    Task<string> RequestSmsCodeAsync(string phoneNumber, CancellationToken ct = default);

    /// <summary>Подтверждение SMS-кода</summary>
    Task<bool> VerifySmsCodeAsync(string phoneNumber, string code, CancellationToken ct = default);

    /// <summary>Вход по фруктовому коду</summary>
    Task<PlayerProfile> LoginByFruitCodeAsync(string phoneNumber, string fruitCodeString, CancellationToken ct = default);

    /// <summary>Вход по QR-коду</summary>
    Task<PlayerProfile> LoginByQrAsync(string qrCode, CancellationToken ct = default);

    /// <summary>Сменить фруктовый код</summary>
    Task<bool> ChangeFruitCodeAsync(Guid userId, string oldCode, string newCode, CancellationToken ct = default);

    /// <summary>Сброс фруктового кода (через SMS)</summary>
    Task<bool> ResetFruitCodeAsync(Guid userId, string smsCode, string newCode, CancellationToken ct = default);
}