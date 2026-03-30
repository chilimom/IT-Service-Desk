using ITServiceDesk.Api.Data;
using ITServiceDesk.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "FrontendCorsPolicy";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ConnectDB")));

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3001",
                "https://localhost:3001",
                "http://localhost:5173",
                "https://localhost:5173",
                "http://localhost:5174",
                "https://localhost:5174",
                "http://localhost:5175",
                "https://localhost:5175",
                "http://localhost:8081",
                "https://localhost:8081",
                "http://127.0.0.1:5174",
                "https://127.0.0.1:5174",
                "http://127.0.0.1:5175",
                "https://127.0.0.1:5175",
                "http://127.0.0.1:8081",
                "https://127.0.0.1:8081",
                "http://10.192.72.45:5173",
                "https://10.192.72.45:5173",
                "http://10.192.72.45:5174",
                "https://10.192.72.45:5174",
                "http://10.192.72.45:5175",
                "https://10.192.72.45:5175",
                "http://10.192.72.45:8081",
                "https://10.192.72.45:8081",
                "http://localhost:3002",
                "https://localhost:3002",
                "http://10.192.72.45:3002",
                "https://10.192.72.45:3002")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TicketService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(FrontendCorsPolicy);
app.MapControllers();

app.Run();
