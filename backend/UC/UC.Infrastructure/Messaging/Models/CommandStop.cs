namespace Orion.Infrastructure.Messaging.Models;

/// <summary>
/// Команда остановки (Barge-in)
/// </summary>
public class CommandStop
{
    public required string DialogId { get; set; }
    public string Command { get; set; } = "stop";
    public string? Reason { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
