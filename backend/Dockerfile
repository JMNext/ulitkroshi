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
COPY ["Orion.API/Orion.API.csproj", "Orion.API/"]
COPY ["Modules/Orion.Auth/Orion.Auth.csproj", "Modules/Orion.Auth/"]
COPY ["Orion.Infrastructure/Orion.Infrastructure.csproj", "Orion.Infrastructure/"]

# Восстанавливаем зависимости для API проекта
RUN dotnet restore "Orion.API/Orion.API.csproj"

# Копируем весь исходный код
COPY . .

# Строим API проект
WORKDIR "/src/Orion.API"
RUN dotnet build "./Orion.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Orion.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Orion.API.dll"]