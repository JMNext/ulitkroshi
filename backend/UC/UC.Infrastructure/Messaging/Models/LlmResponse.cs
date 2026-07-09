namespace Orion.Infrastructure.Messaging.Models;

/// <summary>
/// Ответ от LLM сервиса
/// </summary>
public class LlmResponse
{
    public required string DialogId { get; set; }
    public required string CallId { get; set; }
    public required string Response { get; set; }
    public int TokensUsed { get; set; }
    public int ProcessingTimeMs { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
