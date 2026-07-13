using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UC.Infrastructure.Database.Seeds;

public interface IDbSeeder
{
    public Task SeedAsync();
}
