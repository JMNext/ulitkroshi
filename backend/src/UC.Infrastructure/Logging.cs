using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.SystemConsole.Themes;
using UC.Infrastructure.Settings;
using SeriLogger = Serilog.Core.Logger;

namespace UC.Infrastructure;

public class Logging
{
    public static LoggerConfiguration ApplyServiceSettings(LoggerConfiguration loggerConfiguration, ServiceSettings serviceSettings)
    {
        var loggingSettings = serviceSettings.LoggingSettings;
        // Console sink
        if (loggingSettings.LogToConsole)
        {
            loggerConfiguration = loggerConfiguration.WriteTo.Console(
                outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj} <s:{SourceContext}>{NewLine}{Exception}",
                theme: AnsiConsoleTheme.Code,
                restrictedToMinimumLevel: GetLogLevel(loggingSettings.LogLevel));
        }

        // File sink
        if (loggingSettings.LogToFile && !string.IsNullOrEmpty(loggingSettings.LogFilePath))
        {
            var logPath = GetLogFilePath(loggingSettings.LogFilePath, serviceSettings.Name);
            loggerConfiguration = loggerConfiguration.WriteTo.File(
                path: logPath,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}",
                rollingInterval: RollingInterval.Day,
                restrictedToMinimumLevel: GetLogLevel(loggingSettings.LogLevel),
                retainedFileCountLimit: 31); // Keep logs for 31 days
        }

        // Seq sink
        if (!string.IsNullOrEmpty(loggingSettings.SeqServiceUrl))
        {
            loggerConfiguration = loggerConfiguration.WriteTo.Seq(
                serverUrl: loggingSettings.SeqServiceUrl,
                restrictedToMinimumLevel: GetLogLevel(loggingSettings.LogLevel));
        }

        return loggerConfiguration;
    }

    private static string GetLogFilePath(string basePath, string serviceName)
    {
        var fileName = Path.GetFileNameWithoutExtension(basePath);
        var extension = Path.GetExtension(basePath);
        var directory = Path.GetDirectoryName(basePath) ?? "logs";

        return Path.Combine(directory, $"{fileName}{extension}");
    }

    private static LogEventLevel GetLogLevel(string logLevel) => logLevel?.ToLower() switch
    {
        "verbose" or "trace" => LogEventLevel.Verbose,
        "debug" => LogEventLevel.Debug,
        "warning" or "warn" => LogEventLevel.Warning,
        "error" => LogEventLevel.Error,
        "fatal" or "critical" => LogEventLevel.Fatal,
        _ => LogEventLevel.Information
    };
}
