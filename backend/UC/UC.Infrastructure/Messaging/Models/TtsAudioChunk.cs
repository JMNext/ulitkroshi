namespace Orion.Infrastructure.Messaging.Models;

/// <summary>
/// Чанк синтезированной речи от TTS сервиса
/// </summary>
public class TtsAudioChunk
{
    public required string DialogId { get; set; }
    public required string CallId { get; set; }
    public int Sequence { get; set; }
    public required string AudioData { get; set; } // Base64
    public int DurationMs { get; set; }
    public bool IsFinal { get; set; }
    public int TotalDurationMs { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
