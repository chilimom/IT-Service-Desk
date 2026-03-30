using ITServiceDesk.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ITServiceDesk.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<TicketLog> TicketLogs { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Factory> Factories { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<LoaiTicket> LoaiTicket { get; set; }
        public DbSet<MaintenanceType> MaintenanceTypes { get; set; }
    }
}
