namespace Orion.Infrastructure.Messaging.Models;

/// <summary>
/// Запрос к LLM сервису от Manager
/// </summary>
public class LlmRequest
{
    public required string DialogId { get; set; }
    public required string CallId { get; set; }
    public required string Prompt { get; set; }
    public string? Context { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
