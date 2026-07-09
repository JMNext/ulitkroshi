using System;
using System.Collections.Generic;
using System.Text;

namespace Orion.Infrastructure.Messaging.Models;

/// <summary>
/// Запрос на синтез речи от Manager
/// </summary>
public class TtsRequest
{
    public required string DialogId { get; set; }
    public required string CallId { get; set; }
    public required string Text { get; set; }
    public string Language { get; set; } = "ru";
    public string VoiceId { get; set; } = "ru_female_1";
    public TtsOptions? Options { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
