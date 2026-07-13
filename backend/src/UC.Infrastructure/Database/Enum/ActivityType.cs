namespace UC.Infrastructure.Database.Enum;

/// <summary>
/// Тип действия пользователя
/// </summary>
public enum ActivityType
{
    Login = 1,
    Logout = 2,
    TokenRefresh = 3,
    PageView = 4,
    ApiCall = 5,
    DataChange = 6,
    LoginFailed = 7,
    ClientCreated = 8,
    ClientUpdated = 9,
    ClientDeleted = 10,
    AppointmentCreated = 11,
    AppointmentUpdated = 12,
    AppointmentCancelled = 13,
    CallStarted = 14,
    CallEnded = 15,
    SystemStartup = 16,
    UserRoleChanged = 17
}
