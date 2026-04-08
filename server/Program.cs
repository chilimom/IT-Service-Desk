using ITServiceDesk.Api.Data;
using ITServiceDesk.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// ===== CONFIG PORT BACKEND =====
builder.WebHost.UseUrls(
    "http://localhost:5016", "http://10.192.72.45:5016");

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
                "http://localhost:8081",

                "http://127.0.0.1:8081",

                "http://10.192.72.45:8081")

            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ===== SERVICES =====
builder.Services.AddControllers();
builder.Services.AddScoped<ExternalEmployeeService>();
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
