using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Orion.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MiddleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    InsurancePolicy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Allergies = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MedicalHistory = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RegularDoctor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BirthDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PreferredContactMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PreferredLanguage = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastContactAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Tags = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    CustomFields = table.Column<JsonDocument>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClinicSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClinicSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExportJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ExportType = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    FileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    FilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Filters = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExportJobs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Holidays",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    AffectedDoctorId = table.Column<Guid>(type: "uuid", nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Holidays", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IntegrationSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IntegrationName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SettingKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SettingValue = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntegrationSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Subject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Body = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PromptTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Template = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromptTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MiddleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TimeZone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Language = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AvatarKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AvatarBucket = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AvatarUpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserName = table.Column<string>(type: "text", nullable: true),
                    NormalizedUserName = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    NormalizedEmail = table.Column<string>(type: "text", nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AIContexts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContextType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Summary = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Data = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AIContexts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AIContexts_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Calls",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: true),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CallerId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SessionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ConnectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    QueueTimeSeconds = table.Column<int>(type: "integer", nullable: true),
                    RingTimeSeconds = table.Column<int>(type: "integer", nullable: true),
                    TransferFrom = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TransferTo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsAIHandled = table.Column<bool>(type: "boolean", nullable: false),
                    IsEscalatedToHuman = table.Column<bool>(type: "boolean", nullable: false),
                    EscalatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CallResult = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AudioQualityScore = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Metadata = table.Column<JsonDocument>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Calls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Calls_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Inquiries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    InquiryNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Topic = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    AssignedToUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolutionNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FirstResponseAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsEscalated = table.Column<bool>(type: "boolean", nullable: false),
                    EscalatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EscalationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Metadata = table.Column<JsonDocument>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inquiries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Inquiries_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DoctorSchedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    WorkStart = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    WorkEnd = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    SlotDurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    BreakBetweenSlotsMinutes = table.Column<int>(type: "integer", nullable: false),
                    IsWorkingDay = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorSchedules_User_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AIConversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CallId = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TokensUsed = table.Column<int>(type: "integer", nullable: false),
                    Cost = table.Column<decimal>(type: "numeric", nullable: false),
                    PromptTokens = table.Column<int>(type: "integer", nullable: false),
                    CompletionTokens = table.Column<int>(type: "integer", nullable: false),
                    ResponseTime = table.Column<TimeSpan>(type: "interval", nullable: true),
                    FullPrompt = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    FullResponse = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AIConversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AIConversations_Calls_CallId",
                        column: x => x.CallId,
                        principalTable: "Calls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CallRecordings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CallId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecordUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    RecordFormat = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CallRecordings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CallRecordings_Calls_CallId",
                        column: x => x.CallId,
                        principalTable: "Calls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Dialogues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CallId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MessageCount = table.Column<int>(type: "integer", nullable: false),
                    UserMessageCount = table.Column<int>(type: "integer", nullable: false),
                    AISystemMessageCount = table.Column<int>(type: "integer", nullable: false),
                    Language = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Context = table.Column<JsonDocument>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dialogues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Dialogues_Calls_CallId",
                        column: x => x.CallId,
                        principalTable: "Calls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Dialogues_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TimeSlots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduleId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    IsBooked = table.Column<bool>(type: "boolean", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimeSlots_DoctorSchedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "DoctorSchedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DialogueId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    OrderInDialogue = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProcessingTimeMs = table.Column<int>(type: "integer", nullable: true),
                    ModelUsed = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ConfidenceScore = table.Column<double>(type: "double precision", nullable: true),
                    SentimentScore = table.Column<double>(type: "double precision", nullable: true),
                    Intent = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Entities = table.Column<JsonDocument>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Messages_Dialogues_DialogueId",
                        column: x => x.DialogueId,
                        principalTable: "Dialogues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    InquiryId = table.Column<Guid>(type: "uuid", nullable: true),
                    TimeSlotId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AppointmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Duration = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Procedure = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DoctorName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CancellationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsReminderSent = table.Column<bool>(type: "boolean", nullable: false),
                    ReminderSentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CheckedInAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Metadata = table.Column<JsonDocument>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appointments_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Inquiries_InquiryId",
                        column: x => x.InquiryId,
                        principalTable: "Inquiries",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Appointments_TimeSlots_TimeSlotId",
                        column: x => x.TimeSlotId,
                        principalTable: "TimeSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Transcriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MessageId = table.Column<Guid>(type: "uuid", nullable: false),
                    Text = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    RawText = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Confidence = table.Column<double>(type: "double precision", nullable: false),
                    Language = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    IsFinal = table.Column<bool>(type: "boolean", nullable: false),
                    AudioDuration = table.Column<TimeSpan>(type: "interval", nullable: true),
                    ProcessingTimeMs = table.Column<int>(type: "integer", nullable: true),
                    WordTimings = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transcriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transcriptions_Messages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "Messages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppointmentReminders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduledFor = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Channel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsSent = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentReminders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppointmentReminders_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AIContexts_ClientId",
                table: "AIContexts",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_AIConversations_CallId",
                table: "AIConversations",
                column: "CallId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentReminders_AppointmentId",
                table: "AppointmentReminders",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_AppointmentDate_Status",
                table: "Appointments",
                columns: new[] { "AppointmentDate", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ClientId",
                table: "Appointments",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_InquiryId",
                table: "Appointments",
                column: "InquiryId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TimeSlotId",
                table: "Appointments",
                column: "TimeSlotId");

            migrationBuilder.CreateIndex(
                name: "IX_CallRecordings_CallId",
                table: "CallRecordings",
                column: "CallId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Calls_ClientId",
                table: "Calls",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Calls_SessionId",
                table: "Calls",
                column: "SessionId",
                unique: true,
                filter: "\"SessionId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Calls_StartedAt",
                table: "Calls",
                column: "StartedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Email",
                table: "Clients",
                column: "Email",
                unique: true,
                filter: "\"Email\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_FirstName_LastName",
                table: "Clients",
                columns: new[] { "FirstName", "LastName" });

            migrationBuilder.CreateIndex(
                name: "IX_Clients_PhoneNumber",
                table: "Clients",
                column: "PhoneNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Dialogues_CallId",
                table: "Dialogues",
                column: "CallId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Dialogues_ClientId",
                table: "Dialogues",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSchedules_DoctorId_Date",
                table: "DoctorSchedules",
                columns: new[] { "DoctorId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inquiries_ClientId_Status",
                table: "Inquiries",
                columns: new[] { "ClientId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Inquiries_InquiryNumber",
                table: "Inquiries",
                column: "InquiryNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_DialogueId",
                table: "Messages",
                column: "DialogueId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeSlots_ScheduleId_StartTime",
                table: "TimeSlots",
                columns: new[] { "ScheduleId", "StartTime" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transcriptions_MessageId",
                table: "Transcriptions",
                column: "MessageId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AIContexts");

            migrationBuilder.DropTable(
                name: "AIConversations");

            migrationBuilder.DropTable(
                name: "AppointmentReminders");

            migrationBuilder.DropTable(
                name: "CallRecordings");

            migrationBuilder.DropTable(
                name: "ClinicSettings");

            migrationBuilder.DropTable(
                name: "ExportJobs");

            migrationBuilder.DropTable(
                name: "Holidays");

            migrationBuilder.DropTable(
                name: "IntegrationSettings");

            migrationBuilder.DropTable(
                name: "NotificationTemplates");

            migrationBuilder.DropTable(
                name: "PromptTemplates");

            migrationBuilder.DropTable(
                name: "Transcriptions");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "Inquiries");

            migrationBuilder.DropTable(
                name: "TimeSlots");

            migrationBuilder.DropTable(
                name: "Dialogues");

            migrationBuilder.DropTable(
                name: "DoctorSchedules");

            migrationBuilder.DropTable(
                name: "Calls");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Clients");
        }
    }
}
