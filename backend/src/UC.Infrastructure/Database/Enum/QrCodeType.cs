namespace UC.Infrastructure.Database.Enum;

/// <summary>Тип использованного QR-кода — определяет, что именно он открывает.</summary>
public enum QrCodeType
{
    PetPackageShell = 0,  // QR с упаковки игрушки — выдаёт ракушку
    BonusAccelerate = 1,  // Бонусный QR — ускоряет вылупление
    FriendInvite = 2,     // QR другого игрока — добавление в друзья
    PromoCode = 3         // Промо/маркетинговый код
}