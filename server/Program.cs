using ITServiceDesk.Api.Data;
using ITServiceDesk.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// ===== CONFIG PORT BACKEND =====
builder.WebHost.UseUrls(
    "http://localhost:5018", "http://10.192.72.45:5018");

const string FrontendCorsPolicy = "FrontendCorsPolicy";

// ===== DATABASE =====
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ConnectDB")));

// ===== CORS FOR FRONTEND =====
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:8080",

                "http://127.0.0.1:8080",

                "http://10.192.72.45:8080")

            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ===== SERVICES =====
builder.Services.AddControllers();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TicketService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ===== AUTO UPDATE DATABASE COLUMN =====
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.ExecuteSqlRaw(@"
        IF COL_LENGTH('Tickets', 'Factory') IS NULL
        BEGIN
            ALTER TABLE Tickets ADD Factory NVARCHAR(100) NULL;
        END
    ");

    dbContext.Database.ExecuteSqlRaw(@"
        IF COL_LENGTH('Users', 'AuthorizedFactoryIds') IS NULL
        BEGIN
            ALTER TABLE Users ADD AuthorizedFactoryIds NVARCHAR(200) NULL;
        END
    ");

    dbContext.Database.ExecuteSqlRaw(@"
        IF EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Users'
              AND COLUMN_NAME = 'PasswordHash'
              AND (
                    CHARACTER_MAXIMUM_LENGTH IS NULL
                    OR CHARACTER_MAXIMUM_LENGTH < 256
                  )
        )
        BEGIN
            ALTER TABLE Users ALTER COLUMN PasswordHash NVARCHAR(256) NOT NULL;
        END
    ");
}

// ===== SWAGGER =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ===== MIDDLEWARE =====
app.UseCors(FrontendCorsPolicy);
app.UseAuthentication();
app.MapControllers();
app.UseStaticFiles();
app.Run();
