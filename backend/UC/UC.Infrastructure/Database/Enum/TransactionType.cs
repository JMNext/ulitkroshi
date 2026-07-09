namespace UC.Infrastructure.Database.Enum;

/// <summary>Тип изменения баланса внутриигровой валюты.</summary>
public enum TransactionType
{
    Earned = 0,      // Начислено за действие/уход
    Reward = 1,      // Награда за мини-игру / достижение
    Purchase = 2,    // Списание за покупку в магазине
    Accelerate = 3,  // Списание за ускорение вылупления
    Adjustment = 4,  // Ручная корректировка (админ/поддержка)
    Refund = 5       // Возврат
}