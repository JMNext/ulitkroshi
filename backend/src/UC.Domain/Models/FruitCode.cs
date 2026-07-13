namespace UC.Domain.Models;

public class FruitCode
{
    private readonly List<string> _fruits;
    private readonly string _separator = ",";

    public FruitCode(IEnumerable<string> fruits)
    {
        if (fruits == null || fruits.Count() != 4)
        {
            throw new ArgumentException("Fruit code must contain exactly 4 fruits");
        }

        _fruits = fruits.ToList();
        ValidateFruits();
    }

    public IReadOnlyList<string> Fruits => _fruits.AsReadOnly();

    public string AsString() => string.Join(_separator, _fruits);

    private void ValidateFruits()
    {
        var validFruits = new HashSet<string> { "apple", "banana", "orange", "grape", "strawberry", "kiwi", "pear", "peach" };
        foreach (var fruit in _fruits)
        {
            if (!validFruits.Contains(fruit.ToLowerInvariant()))
            {
                throw new ArgumentException($"Invalid fruit: {fruit}");
            }
        }
    }

    public static FruitCode FromString(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            throw new ArgumentException("Fruit code cannot be empty");
        }

        var fruits = value.Split(',', StringSplitOptions.RemoveEmptyEntries);
        return new FruitCode(fruits);
    }

    public override bool Equals(object? obj)
    {
        return obj is FruitCode other && Fruits.SequenceEqual(other.Fruits);
    }

    public override int GetHashCode()
    {
        return Fruits.Aggregate(0, (hash, f) => hash ^ f.GetHashCode());
    }
}