# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Копируем все .csproj файлы из текущей структуры
COPY ["UC.Presentation/UC.Presentation.csproj", "UC.Presentation/"]
COPY ["UC.Auth/UC.Auth.csproj", "UC.Auth/"]
COPY ["UC.Infrastructure/UC.Infrastructure.csproj", "UC.Infrastructure/"]

# Восстанавливаем зависимости для API проекта
RUN dotnet restore "UC.Presentation/UC.Presentation.csproj"

# Копируем весь исходный код
COPY . .

# Строим API проект
WORKDIR "/src/UC.Presentation"
RUN dotnet build "./UC.Presentation.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./UC.Presentation.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "UC.Presentation.dll"]