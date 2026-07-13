# Инфраструктурный слой для работы с базой данных, логировнием, а также для управления миграциями и конфигурацией базы данных

## Миграции и обновление базы данных

```bash
dotnet ef migrations add InitialCreate --context UcDbContext
dotnet ef database update --context UcDbContext

dotnet ef migrations add InitialCreate --context IdentityAppDbContext
dotnet ef database update --context  IdentityAppDbContext


```


## Update ef tools

### It's recomended to update ef tools to the latest version to avoid any issues with migrations and database updates (10.0.0+)

```bash
dotnet tool update --global dotnet-ef
```