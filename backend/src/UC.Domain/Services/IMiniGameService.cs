using UC.Domain.Models;
using UC.Infrastructure.Database.Entities;
using UC.Infrastructure.Database.Enum;

namespace UC.Domain.Services;

public interface IMiniGameService
{
    /// <summary>Сохранить результат мини-игры</summary>
    Task<MiniGameResult> SaveResultAsync(Guid userId, MiniGameType gameType, int score, bool isWin, CancellationToken ct = default);

    /// <summary>Получить историю игр</summary>
    Task<List<MiniGameResult>> GetHistoryAsync(Guid userId, int page = 1, int pageSize = 20, CancellationToken ct = default);

    /// <summary>Получить статистику по мини-играм</summary>
    Task<MiniGameStatistics> GetStatisticsAsync(Guid userId, CancellationToken ct = default);
}

