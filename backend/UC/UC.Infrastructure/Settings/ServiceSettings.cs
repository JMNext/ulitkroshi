namespace Orion.Infrastructure.Settings;

public class ServiceSettings
{
    public string Name { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public LoggingSettings LoggingSettings { get; set; } = new();
}
