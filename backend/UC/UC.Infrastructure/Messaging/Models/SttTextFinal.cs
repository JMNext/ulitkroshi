namespace Orion.Infrastructure.Messaging.Models;

/// <summary>
/// Финальный результат распознавания речи от STT сервиса
/// </summary>
public class SttTextFinal
{
    public required string DialogId { get; set; }
    public required string CallId { get; set; }
    public required string Text { get; set; }
    public double Confidence { get; set; }
    public string? Language { get; set; }
    public bool IsFinal { get; set; }
    public int SegmentDurationMs { get; set; }
    public string VadTrigger { get; set; } = "speech_end";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
