using System;
using System.Collections.Generic;
using System.Text;
using Orion.Infrastructure.Messaging.Enums;

namespace Orion.Infrastructure.Messaging.Models;

/// <summary>
/// Чанк речи от VAD сервиса для STT
/// </summary>
public class VadSpeechChunk
{
    public required string DialogId { get; set; }
    public required string CallId { get; set; }
    public int Sequence { get; set; }
    public required string AudioData { get; set; } // Base64
    public int DurationMs { get; set; }
    public VadEventType VadEvent { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
