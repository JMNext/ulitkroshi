namespace Orion.Infrastructure.Messaging.Enums;

/// <summary>
/// Тип события детектора речи
/// </summary>
public enum VadEventType
{
    SpeechStart = 1,
    SpeechContinue = 2,
    SpeechEnd = 3
}
