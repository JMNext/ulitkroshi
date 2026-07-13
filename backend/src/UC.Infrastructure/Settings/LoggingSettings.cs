namespace UC.Infrastructure.Settings;

public class LoggingSettings
{
    public bool LogToConsole { get; set; } = true;
    public bool LogToFile { get; set; } = true;
    public string LogFilePath { get; set; } = "logs/minicrm-backend.log";
    public string LogLevel { get; set; } = "Information";
    public string? SeqServiceUrl { get; set; }
}
